// @flow
import io from 'socket.io-client'
import {listenForTableSync, onConnectToPeer, registerSendEventsObserver} from './index'
import type {Peer} from './index'
import {setSendEventSync, setSendTableSync} from '../state/GlobalState'

setSendEventSync(true)
setSendTableSync(false)

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
    connectToPeer(address).then(peer => {
      listenForTableSync(peer)
      onConnectToPeer(peer)
    })
  })
}
