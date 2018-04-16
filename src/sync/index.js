// @flow

import {STUB} from '../utils'
import {Event, handleEvent as internalEventHandler} from '../events'
import {getCommunityEvents, getEvents} from '../db/EventTable'
import {getCurrentAgentId} from '../state/GlobalState'

const REQUEST_UPDATE_CHANNEL = 'requestUpdate'
const REQUEST_UPDATE_ALL = ':all:'
const EVENT_CHANNEL = 'event'
const READY_CHANNEL = 'ready'

export type Peer = {
  agentId: string,
  socket: any,
  address: string
}

export var peers: Array<Peer> = []

export function notifyPeers (event: Event): void {
  STUB()
}

export function requestUpdate (socket): void {

}

export function requestCommunityUpdate (socket, communityId: string, fromTimestamp: number): Promise<any> {
  console.log('UPDATE -->', communityId, fromTimestamp)
  return new Promise(resolve => {
    socket.emit(REQUEST_UPDATE_CHANNEL, {communityId, fromTimestamp}, ack => {
      resolve(ack)
    })
  })
}

export function listenForUpdateRequests (socket): void {
  socket.on(REQUEST_UPDATE_CHANNEL, (request, ackFn) => {
    console.log('UPDATE <-- (r)', request)
    ackFn(REQUEST_UPDATE_CHANNEL + '.ack')
    handleUpdateRequest(socket, request.communityId, request.fromTimestamp)
  })
}

function listenForEvents (peer: Peer) {
  peer.socket.on(EVENT_CHANNEL, (event, ackFn) => {
    ackFn(EVENT_CHANNEL + '.ack')
    backlogEvent(event, peer)
  })
}

let eventBacklog: Array<Event> = []

function backlogEvent (event: Event, peer: Peer) {
  console.log(`Backlogging event from ${peer.agentId} to be consumed later`, event)
  event.receivedFrom = peer.agentId.trim()
  eventBacklog.push(event)
  consumeEvents()
}

let isConsuming = false
async function consumeEvents () {
  if (!isConsuming) {
    isConsuming = true

    let event = eventBacklog.shift()
    while (event) {
      await internalEventHandler(event).catch(e => {
        console.log('Sync event handler failed', e)
      })
      event = eventBacklog.shift()
    }

    isConsuming = false
  }
}

async function handleUpdateRequest (socket, communityId: string, fromTimestamp: number) {
  console.log('Handling UPDATE request', communityId, fromTimestamp)

  let relevantEntries
  if (communityId === REQUEST_UPDATE_ALL) {
    relevantEntries = await getEvents(fromTimestamp)
  } else {
    relevantEntries = await getCommunityEvents(communityId, fromTimestamp)
  }

  relevantEntries.forEach(e => {
    console.log('EVENT -->', e)
    socket.emit(EVENT_CHANNEL, e, ack => {
      console.log(EVENT_CHANNEL + '.ack')
    })
  })
}

export function onConnectToPeer (peer: Peer) {
  console.log('Connection established to peer', peer.address)
  peers.push(peer)

  listenForEvents(peer)
  listenForUpdateRequests(peer.socket)

  let hasRequestedFlag = false
  const reqUpd = () => {
    if (!hasRequestedFlag) {
      hasRequestedFlag = true
      requestCommunityUpdate(peer.socket, REQUEST_UPDATE_ALL, 0)
    }
  }

  peer.socket.on(READY_CHANNEL, (peerInfo, ackFn) => {
    console.log(`Peer (at address ${peer.address}) Agent ID is set to ${peerInfo.agentId} (L)`)
    ackFn({agentId: getCurrentAgentId()})
    reqUpd()
  })

  peer.socket.emit(READY_CHANNEL, {agentId: getCurrentAgentId()}, peerInfo => {
    console.log(`Peer (at address ${peer.address}) Agent ID is set to ${peerInfo.agentId} (E)`)
    peer.agentId = peerInfo.agentId
    reqUpd()
  })
}
