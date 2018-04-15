// @flow

import {STUB} from '../utils'
import {Event} from '../events'
import {getCommunityEvents} from '../db/EventTable'

const REQUEST_UPDATE = 'requestUpdate'

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

export function requestUpdateFromPeer (peer: Peer, communityId: string, fromTimestamp: number): Promise<any> {
  return new Promise(resolve => {
    peer.socket.emit(REQUEST_UPDATE, {communityId, fromTimestamp}, ack => {
      resolve(ack)
    })
  })
}

export function listenForUpdateRequests (socket): void {
  socket.on(REQUEST_UPDATE, (request, ackFn) => {
    console.log('Server is asked for update', request)
    ackFn(REQUEST_UPDATE + '.ack')
    handleUpdateRequest(socket, request.communityId, request.fromTimestamp)
  })
}

export async function handleUpdateRequest (socket, communityId: string, fromTimestamp: number) {
  console.log('trying to handle an update request', communityId, fromTimestamp)

  const relevantEntries = await getCommunityEvents(communityId, fromTimestamp)
  relevantEntries.forEach(e => {
    console.log('sending event', e)
    socket.emit('event', e)
  })
}
