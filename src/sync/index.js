// @flow

import {Event, handleEvent as internalEventHandler} from '../events'
import {EVENT_TABLE, getCommunityEvents, getEvents} from '../db/EventTable'
import {getCurrentAgentId, PLENTY_VERSION} from '../state/GlobalState'
import {nSQL} from 'nano-sql'
import {getSyncedUpToInAll, logSync} from '../db/PeerSyncTable'

const REQUEST_UPDATE_CHANNEL = 'requestUpdate'
const REQUEST_UPDATE_ALL = ':all:'
export const EVENT_CHANNEL = 'event'
const READY_CHANNEL = 'ready'

export const NO_EVENTS_BEFORE = 1524749468216

export type Peer = {
  agentId: string,
  socket: any,
  address: string
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

function listenForUpdateRequests (socket): void {
  socket.on(REQUEST_UPDATE_CHANNEL, (request, ackFn) => {
    console.log('UPDATE <-- (r)', request)
    ackFn(REQUEST_UPDATE_CHANNEL + '.ack')
    handleUpdateRequest(socket, request.communityId, request.fromTimestamp)
  })
}

function listenForEvents (peer: Peer) {
  peer.socket.on(EVENT_CHANNEL, (event, ackFn) => {
    console.log(`EVENT <-- ${peer.agentId}`, event)
    ackFn(EVENT_CHANNEL + '.ack')
    if (event.timestamp && event.timestamp > NO_EVENTS_BEFORE) {
      _backlogEvent(event, peer)
    } else {
      console.log('Skipping received event based on time')
    }
  })
}

/** watch the database for new events, and send them out to all peers */
export function registerSendEventsObserver () {
  nSQL(EVENT_TABLE).on('upsert', (queryEvent) => {
    peers.forEach(peer => {
      if (peer.socket.connected) {
        queryEvent.affectedRows.forEach(_event => {
          const event = Object.assign({}, _event, {plentyVersion: PLENTY_VERSION})
          // checking that this event didn't come from the peer
          if (!event.receivedFrom.includes(peer.agentId)) {
            console.log(`EVENT (n) --> ${peer.agentId}`)
            peer.socket.emit(EVENT_CHANNEL, event, ack => {
              console.log(EVENT_CHANNEL + '.new.ack' + '  ' + event.globalEventId)
            })
          } else {
            console.log(`Skipping sending new event to ${peer.agentId}`)
          }
        })
      }
    })
  })
}

// export let _eventBacklog: Array<Event> = []
// export function _backlogEvent (_event: Event, peer: Peer) {
//   const event = {..._event}
//   delete event.handledEventSuccessfully
//
//   // console.log(`Backlogging event from ${peer.agentId} to be consumed later`, event)
//
//   if (!(event.receivedFrom instanceof Array)) {
//     throw new TypeError('Could not backlog event. `receivedFrom` is not an array')
//   }
//   event.receivedFrom = new Set(event.receivedFrom)
//
//   if (peer.agentId) {
//     event.receivedFrom.add(peer.agentId.trim())
//   }
//   _eventBacklog.push(event)
//   logSync(peer.agentId, event.communityId, event.timestamp)
//   consumeEvents()
// }
//
// export var _isConsuming = false
// async function consumeEvents () {
//   if (!_isConsuming) {
//     _isConsuming = true
//
//     let event = _eventBacklog.shift()
//     while (event) {
//       await internalEventHandler(event).catch(e => {
//         console.log('Sync event handler failed', e)
//       })
//       event = _eventBacklog.shift()
//     }
//
//     _isConsuming = false
//   }
// }

async function handleUpdateRequest (socket, communityId: string, fromTimestamp: number) {
  console.log('Handling UPDATE request', communityId, new Date(fromTimestamp))

  let relevantEntries
  if (communityId === REQUEST_UPDATE_ALL) {
    relevantEntries = await getEvents(fromTimestamp)
  } else {
    relevantEntries = await getCommunityEvents(communityId, fromTimestamp)
  }

  // fixme wait for callback to emit
  // fixme create a global queue

  relevantEntries.forEach(_e => {
    const e = Object.assign({}, _e, {plentyVersion: PLENTY_VERSION})
    console.log('EVENT -->', e)
    socket.emit(EVENT_CHANNEL, e, ack => {
      console.log(EVENT_CHANNEL + '.ack' + '  ' + e.globalEventId)
    })
  })
}

export function onConnectToPeer (peer: Peer) {
  console.log('Connection established to peer', peer.address)
  peers.push(peer)

  listenForEvents(peer)
  listenForUpdateRequests(peer.socket)

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
