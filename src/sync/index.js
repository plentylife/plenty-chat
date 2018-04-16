// @flow

import {STUB} from '../utils'
import {Event, handleEvent as internalEventHandler} from '../events'
import {getCommunityEvents, getEvents} from '../db/EventTable'

const REQUEST_UPDATE_CHANNEL = 'requestUpdate'
const REQUEST_UPDATE_ALL = ':all:'
const EVENT_CHANNEL = 'event'
const READY_CHANNEL = 'ready'

export type Peer = {
  socketId: string,
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
  console.log('Requesting update', communityId, fromTimestamp)
  return new Promise(resolve => {
    socket.emit(REQUEST_UPDATE_CHANNEL, {communityId, fromTimestamp}, ack => {
      resolve(ack)
    })
  })
}

export function listenForUpdateRequests (socket): void {
  socket.on(REQUEST_UPDATE_CHANNEL, (request, ackFn) => {
    console.log('Update requested', request)
    ackFn(REQUEST_UPDATE_CHANNEL + '.ack')
    handleUpdateRequest(socket, request.communityId, request.fromTimestamp)
  })
}

function listenForEvents (socket) {
  socket.on(EVENT_CHANNEL, (event, ackFn) => {
    ackFn(EVENT_CHANNEL + '.ack')
    backlogEvents(event)
  })
}

let eventBacklog: Array<Event> = []

function backlogEvents (event) {
  console.log('Event handler', event)
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
  console.log('trying to handle an update request', communityId, fromTimestamp)

  let relevantEntries
  if (communityId === REQUEST_UPDATE_ALL) {
    relevantEntries = await getEvents(fromTimestamp)
  } else {
    relevantEntries = await getCommunityEvents(communityId, fromTimestamp)
  }

  relevantEntries.forEach(e => {
    console.log('sending event', e)
    socket.emit('event', e, ack => {
      console.log(EVENT_CHANNEL + '.ack')
    })
  })
}

export function onConnectToPeer (peer: Peer) {
  console.log('Connection established to peer', peer.address, peer.socketId)
  peers.push(peer)

  listenForEvents(peer.socket)
  listenForUpdateRequests(peer.socket)

  let hasRequestedFlag = false
  const reqUpd = () => {
    if (!hasRequestedFlag) {
      hasRequestedFlag = true
      requestCommunityUpdate(peer.socket, REQUEST_UPDATE_ALL, 0)
    }
  }

  peer.socket.on(READY_CHANNEL, (empty, ackFn) => {
    console.log('Peer is ready', peer.socketId)
    ackFn(READY_CHANNEL + '.ack')
    reqUpd()
  })

  peer.socket.emit(READY_CHANNEL, '', ack => {
    console.log(ack)
    reqUpd()
  })
}
