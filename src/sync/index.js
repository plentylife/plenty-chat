// @flow

import {Event, handleEvent as internalEventHandler} from '../events'
import {EVENT_TABLE, getCommunityEvents, getEvents} from '../db/EventTable'
import {getCurrentAgentId, getSendEventSync, getSendTableSync, PLENTY_VERSION} from '../state/GlobalState'
import {nSQL} from 'nano-sql'
import {getSyncedUpToInAll, logSync} from '../db/PeerSyncTable'
import {generateAllTableSyncMessages, receiveTableSyncMessage} from './TableSync'
import {MaxRetriesReached, PeerNotConnected} from '../utils/Error'

const REQUEST_UPDATE_CHANNEL = 'requestUpdate'
const REQUEST_UPDATE_ALL = ':all:'
export const EVENT_CHANNEL = 'event'
const TABLE_SYNC_CHANNEL = 'table-sync'
const READY_CHANNEL = 'ready'

export const NO_EVENTS_BEFORE = 1524749468216
const MIN_PLENTY_VERSION = 180601

const EVENT_ACK_TIMEOUT = 60 * 1000
const MAX_EVENT_RETRIES = 3

export type Peer = {
  agentId: string,
  socket: any,
  address: string,
  trackingCounter: number,
  hadAndNotInUpdate: boolean,
  hadUpdatePromise: Promise<void>,
  hadUpdatePromiseResolver: () => void
}

export var peers: Array<Peer> = []

export function requestUpdate (socket): void {

}

export function requestCommunityUpdate (socket, communityId: string, fromTimestamp: number): Promise<any> {
  if (typeof fromTimestamp !== 'number') throw new TypeError('fromTimestamp must be a number')
  console.log('UPDATE -->', communityId, new Date(fromTimestamp))
  return new Promise(resolve => {
    socket.emit(REQUEST_UPDATE_CHANNEL, {communityId, fromTimestamp}, ack => {
      resolve(ack)
    })
  })
}

function listenForUpdateRequests (peer): void {
  peer.socket.on(REQUEST_UPDATE_CHANNEL, (request, ackFn) => {
    console.log('UPDATE <-- (r)', request)
    ackFn(REQUEST_UPDATE_CHANNEL + '.ack')
    handleUpdateRequest(peer, request.communityId, request.fromTimestamp)
  })
}

function listenForEvents (peer: Peer) {
  peer.socket.on(EVENT_CHANNEL, (event, ackFn) => {
    console.log(`EVENT <-- ${peer.agentId}`, event)
    if (event.timestamp && event.timestamp > NO_EVENTS_BEFORE &&
      event.plentyVersion && event.plentyVersion >= MIN_PLENTY_VERSION) {
      _receiveEvent(event, peer)
      ackFn(EVENT_CHANNEL + '.ack')
    } else {
      ackFn(EVENT_CHANNEL + '.failed')
      console.log('Skipping received event based on time or version')
    }
  })
}

let outgoingQueue: Array<[Peer, Event]> = []

function addToOutgoingQueue (peer: Peer, event: Event) {
  outgoingQueue.push([peer, event])
  consumeOutgoingQueue()
}

let _isConsumingOutgoingQueue = false
async function consumeOutgoingQueue () {
  console.log('outgoing queue is consuming', _isConsumingOutgoingQueue)
  if (!_isConsumingOutgoingQueue) {
    _isConsumingOutgoingQueue = true

    let next = outgoingQueue.shift()
    let peer = next[0]
    let event = next[1]
    while (event) {
      console.log('outgoing queue is about to emit event. there are left', outgoingQueue.length)
      try {
        await emitEvent(peer, event)
      } catch (e) {
        // removing all events for a given peer
        console.log(`sending event ${event.globalEventId} to agent ${peer.agentId} failed`, e)
        outgoingQueue = outgoingQueue.filter(q => (q[0].agentId !== peer.agentId))
      }
      next = outgoingQueue.shift()
      if (next) {
        peer = next[0]
        event = next[1]
      } else {
        event = null
      }
    }

    console.log('outgoing queue finished consuming')
    _isConsumingOutgoingQueue = false
  }
}

function emitEvent (peer: Peer, event: Event): Promise<void> {
  return new Promise((resolve, reject) => {
    return _emitEvent(peer, event, resolve, reject)
  })
}

function _emitEvent (peer: Peer, event: Event, resolve, reject, tryCount: number = 0): Promise<void> {
  console.log(`EVENT (n) [${event.globalEventId}] --> ${peer.agentId} \t (try ${tryCount + 1} / ${MAX_EVENT_RETRIES})`)

  if (tryCount >= MAX_EVENT_RETRIES) reject(new MaxRetriesReached(event.globalEventId))
  const outgoingEvent = Object.assign({}, event, {plentyVersion: PLENTY_VERSION})

  if (!peer.socket.connected) reject(new PeerNotConnected(peer.agentId))
  let timeout

  peer.socket.emit(EVENT_CHANNEL, outgoingEvent, ack => {
    console.log(EVENT_CHANNEL + '.ack' + '  ' + event.globalEventId)
    timeout && clearTimeout(timeout)
    resolve()
  })

  timeout = setTimeout(() => {
    _emitEvent(peer, event, resolve, reject, tryCount + 1)
  }, EVENT_ACK_TIMEOUT)
}

/** watch the database for new events, and send them out to all peers */
export function registerSendEventsObserver () {
  nSQL(EVENT_TABLE).on('upsert', (queryEvent) => {
    // console.log(`trying to send events ${queryEvent.affectedRows.map(r => (r.globalEventId))} to peers`, peers.map(p => (p.agentId)))
    peers.forEach(async peer => {
      await peer.hadUpdatePromise // waiting for the first update to happen before sending out the rest

      if (peer.socket.connected) {
        queryEvent.affectedRows.forEach(_event => {
          const event = Object.assign({}, _event, {plentyVersion: PLENTY_VERSION})
          // checking that this event didn't come from the peer
          if (!event.receivedFrom.includes(peer.agentId)) {
            addToOutgoingQueue(peer, event)
          } else {
            console.log(`Skipping sending new event to ${peer.agentId}`)
          }
        })
      }
    })
  })
}

export async function _receiveEvent (_event: Event, peer: Peer) {
  const event = {..._event}
  delete event.handledEventSuccessfully

  if (!(event.receivedFrom instanceof Array)) {
    throw new TypeError('Could not receive event. `receivedFrom` is not an array')
  }
  event.receivedFrom = new Set(event.receivedFrom)

  if (peer.agentId) {
    event.receivedFrom.add(peer.agentId.trim())
  }
  await logSync(peer.agentId, event.communityId, event.timestamp)
  return internalEventHandler(event)
}

async function handleUpdateRequest (peer: Peer, communityId: string, fromTimestamp: number) {
  if (peer.hadUpdatePromise === null) setHadUpdatePromise(peer)

  console.log('Handling UPDATE request', communityId, new Date(fromTimestamp))

  // fixme these updates should happen by community
  if (getSendEventSync()) {
    let relevantEntries
    if (communityId === REQUEST_UPDATE_ALL) {
      relevantEntries = await getEvents(fromTimestamp)
    } else {
      relevantEntries = await getCommunityEvents(communityId, fromTimestamp)
    }
    console.log('Sending event sync', relevantEntries.length)
    relevantEntries.forEach((_e: Event) => {
      if (!_e.receivedFrom.has(peer.agentId)) {
        addToOutgoingQueue(peer, _e)
      }
    })
  }

  if (getSendTableSync()) {
    console.log('Sending table sync')
    await doTableSync(peer, fromTimestamp)
    console.log('Table sync completed')
  }

  console.log(`resolving hadUpdatePromise for peer ${peer.agentId}`)
  peer.hadUpdatePromiseResolver()
}

async function doTableSync (peer: Peer, fromTimestamp: number): Promise<void> {
  let tableSyncMsgs = await generateAllTableSyncMessages(fromTimestamp)
  let count = tableSyncMsgs.length
  console.log(`Table sync has ${count} messages to send`)
  if (count === 0) return Promise.resolve()

  return new Promise(resolve => {
    tableSyncMsgs.forEach(msg => {
      peer.socket.emit(TABLE_SYNC_CHANNEL, msg, ack => {
        count--
        console.log(TABLE_SYNC_CHANNEL + '.ack | ' + count + ' left')
        if (count === 0) resolve()
      })
    })
  })
}

export function listenForTableSync (peer: Peer) {
  peer.socket.on(TABLE_SYNC_CHANNEL, (msg, ackFn) => {
    console.log(`TABLE SYNC <-- ${peer.agentId}`, msg)
    receiveTableSyncMessage(peer, msg)
    ackFn(TABLE_SYNC_CHANNEL + '.ack')
  })
}

function setHadUpdatePromise (peer: Peer) {
  peer.hadUpdatePromise = new Promise(resolve => {
    peer.hadUpdatePromiseResolver = resolve
  }).then(() => {
    peer.hadUpdatePromise = null
  })
}

export function onConnectToPeer (peer: Peer) {
  console.log('Connection established to peer', peer.address)

  setHadUpdatePromise(peer)
  peers.push(peer)

  listenForEvents(peer)
  listenForUpdateRequests(peer)
  if (getCurrentAgentId() !== 'server-default-id') listenForTableSync(peer)

  let hasRequestedFlag = false
  const reqUpd = async () => {
    if (!hasRequestedFlag) {
      hasRequestedFlag = true
      const timestamp = await getSyncedUpToInAll(peer.agentId)
      requestCommunityUpdate(peer.socket, REQUEST_UPDATE_ALL, timestamp) // todo. updateAll is a hack
    }
  }

  listenForTeardown(peer)

  const myPeerInfo = {agentId: getCurrentAgentId()}
  peer.socket.on(READY_CHANNEL, (peerInfo, ackFn) => {
    console.log(`Peer (at address ${peer.address}) Agent ID is set to ${peerInfo.agentId} (L)`)
    peer.agentId = peerInfo.agentId
    ackFn(myPeerInfo)
    reqUpd()
  })

  peer.socket.emit(READY_CHANNEL, myPeerInfo, peerInfo => {
    console.log(`Peer (at address ${peer.address}) Agent ID is set to ${peerInfo.agentId} (E)`)
    peer.agentId = peerInfo.agentId
    reqUpd()
  })
}

function listenForTeardown (peer: Peer) {
  peer.socket.on('disconnect', () => {
    console.log(`Websocket for peer ${peer.agentId} has disconnected`)

    peer.socket.off && peer.socket.off()
    if (peer.socket.removeAllListeners) {
      peer.socket.removeAllListeners(REQUEST_UPDATE_CHANNEL)
      peer.socket.removeAllListeners(EVENT_CHANNEL)
      peer.socket.removeAllListeners(READY_CHANNEL)
      peer.socket.removeAllListeners(TABLE_SYNC_CHANNEL)
      peer.socket.removeAllListeners('reconnect')
      peer.socket.removeAllListeners('disconnect')
    }

    peers = peers.filter(p => (p.agentId !== peer.agentId))
    console.log('peers', peers.map(p => (p.agentId)))

    peer.socket.on('reconnect', async () => {
      console.log('Reconnected to', peer.agentId)
      onConnectToPeer(peer)
    })
  })
}
