// @flow

import {STUB} from '../utils'
import {Event} from '../events'
import {getCommunityEvents, getEvents} from '../db/EventTable'

const REQUEST_UPDATE_CHANNEL = 'requestUpdate'
const REQUEST_UPDATE_ALL = ':all:'
const EVENT_CHANNEL = 'event'

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
    handleEvent(event)
  })
}

function handleEvent (event) {
  console.log('EVENT', event)
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
    socket.emit('event', e)
  })
}

export function onConnectToPeer (peer: Peer) {
  console.log('Connection established to peer', peer.address, peer.socketId)
  peers.push(peer)

  listenForEvents(peer.socket)
  listenForUpdateRequests(peer.socket)
  return requestCommunityUpdate(peer.socket, REQUEST_UPDATE_ALL, 0)
}
