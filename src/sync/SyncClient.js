// @flow
import io from 'socket.io-client'
import {onConnectToPeer, registerSendEventsObserver} from './index'
import type {Peer} from './index'

export function connectToPeer (peer: string): Promise<Peer> {
  const socket = io(peer)
  return new Promise((resolve, reject) => {
    socket.on('connect', (d) => {
      resolve({
        socket, address: peer
      })
    })
  })
}

/** Starts the synchronization process between this agent and the peers */
export function startSync (peers: Array<string>): void {
  registerSendEventsObserver()
  peers.forEach(address => {
    console.log('Starting sync with', address)
    connectToPeer(address).then(onConnectToPeer)
  })
}
