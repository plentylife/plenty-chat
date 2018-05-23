// @flow

import {Event, handleEvent as internalEventHandler} from '../events'
import {EVENT_TABLE, getCommunityEvents, getEvents} from '../db/EventTable'
import {getCurrentAgentId, getSendEventSync, getSendTableSync, PLENTY_VERSION} from '../state/GlobalState'
import {nSQL} from 'nano-sql'
import {getSyncedUpToInAll, logSync} from '../db/PeerSyncTable'
import {generateAllTableSyncMessages, receiveTableSyncMessage} from './TableSync'

const REQUEST_UPDATE_CHANNEL = 'requestUpdate'
const REQUEST_UPDATE_ALL = ':all:'
export const EVENT_CHANNEL = 'event'
const TABLE_SYNC_CHANNEL = 'table-sync'
const READY_CHANNEL = 'ready'

export const NO_EVENTS_BEFORE = 1524749468216
const MIN_PLENTY_VERSION = 180523

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
  if (!_isConsumingOutgoingQueue) {
    _isConsumingOutgoingQueue = true

    let next = outgoingQueue.shift()
    let peer = next[0]
    let event = next[1]
    while (event) {
      await emitEvent(peer, event)
      next = outgoingQueue.shift()
      if (next) {
        peer = next[0]
        event = next[1]
      } else {
        event = null
      }
    }

    _isConsumingOutgoingQueue = false
  }
}

function emitEvent (peer: Peer, event: Event): Promise<void> {
  return new Promise(resolve => {
    console.log(`EVENT (n) --> ${peer.agentId}`)

    const outgoingEvent = Object.assign({}, event, {plentyVersion: PLENTY_VERSION})
    peer.socket.emit(EVENT_CHANNEL, outgoingEvent, ack => {
      console.log(EVENT_CHANNEL + '.ack' + '  ' + event.globalEventId)
      resolve()
    })
  })
}

/** watch the database for new events, and send them out to all peers */
export function registerSendEventsObserver () {
  nSQL(EVENT_TABLE).on('upsert', (queryEvent) => {
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
    console.log('Sending event sync')
    relevantEntries.forEach((_e: Event) => {
      if (!_e.receivedFrom.has(peer.agentId)) {
        addToOutgoingQueue(peer, _e)
      }
    })
  }

  if (getSendTableSync()) {
    console.log('Sending table sync')
    await doTableSync(peer, fromTimestamp)
  }

  peer.hadUpdatePromiseResolver()
}

async function doTableSync (peer: Peer, fromTimestamp: number): Promise<void> {
  let tableSyncMsgs = await generateAllTableSyncMessages(fromTimestamp)
  let count = tableSyncMsgs.length
  if (count === 0) return Promise.resolve()

  return new Promise(resolve => {
    tableSyncMsgs.forEach(msg => {
      peer.socket.emit(TABLE_SYNC_CHANNEL, msg, ack => {
        count--
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

  let hasRequestedFlag = false
  const reqUpd = async () => {
    if (!hasRequestedFlag) {
      hasRequestedFlag = true
      const timestamp = await getSyncedUpToInAll(peer.agentId)
      requestCommunityUpdate(peer.socket, REQUEST_UPDATE_ALL, timestamp) // todo. updateAll is a hack
    }
  }

  peer.socket.on('reconnect', async () => {
    const timestamp = await getSyncedUpToInAll(peer.agentId)
    console.log('Reconnected to', peer.agentId, 'requesting updates upto', timestamp)
    requestCommunityUpdate(peer.socket, REQUEST_UPDATE_ALL, timestamp) // todo. updateAll is a hack
  })

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
