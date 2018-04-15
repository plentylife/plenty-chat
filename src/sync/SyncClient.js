// @flow
import io from 'socket.io-client'

export function connectToPeer (peer: string): Promise<string> {
  const socket = io(peer)
  return new Promise((resolve, reject) => {

    socket.on('connection', (d) => {
      console.log('client connection')
      resolve('connection')
    })
    socket.on('connect', (d) => {
      console.log('client connect')
      resolve('connect')
    })
  })
}
