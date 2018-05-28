// @flow

import {CRON_TIME, setCurrentAgentId, setSendEventSync, setSendTableSync} from '../state/GlobalState'
import {onConnectToPeer, registerSendEventsObserver} from './index'
import '../db/index'
import {nSQL} from 'nano-sql'
import type {Peer} from './index'
import {applyDemurrageToAll, splitAllCommunityPots} from '../actions/AccountingActions'
import {NOTIFY_PERIOD, notifyAll} from '../email/Notifications'

console.log('Starting server')

setCurrentAgentId('server-default-id')
setSendEventSync(false)
setSendTableSync(true)

const server = require('http').createServer()
const io = require('socket.io')(server, {
  serveClient: false // do not serve the client file, in that case the brfs loader is not needed
})
const port = process.env.PORT || 3000

console.log('Node env', process.env.NODE_ENV)
// console.log('DB mode', DB_MODE)
console.log('DB name', process.env.DB_NAME)
console.log('Socket debug', process.env.DEBUG)

registerSendEventsObserver() // sends out new events as they come in

nSQL().connect().then(() => {
  console.log('DB connected')

  io.on('connection', (socket) => {
    console.log('Server socket connect', socket.id)
    const peer: Peer = {
      address: null,
      socket: socket
    }
    onConnectToPeer(peer)
  })

  server.listen(port, () => console.log('server listening on port ' + port))

  setInterval(async () => {
    console.log('\nCRON\n', new Date())
    await applyDemurrageToAll()
    await splitAllCommunityPots()
  }, CRON_TIME * 60 * 1000)

  setInterval(async () => {
    console.log('\nEmail Cron\n', new Date())
    await notifyAll()
  }, NOTIFY_PERIOD)
})
