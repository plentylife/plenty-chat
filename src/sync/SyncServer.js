import {DB_MODE} from '../state/GlobalState'
import {listenForUpdateRequests} from './index'
import '../db/index'
import {nSQL} from 'nano-sql'

console.log('Starting server')

const server = require('http').createServer()
const io = require('socket.io')(server, {
  serveClient: false // do not serve the client file, in that case the brfs loader is not needed
})
const port = process.env.PORT || 3000

server.listen(port, () => console.log('server listening on port ' + port))

console.log('Node env', process.env.NODE_ENV)
console.log('DB mode', DB_MODE)
console.log('DB name', process.env.DB_NAME)
console.log('Socket debug', process.env.DEBUG)

nSQL().connect().then(c => {
  console.log('DB connected', c)

  io.on('connection', (socket) => {
    console.log('Server connected to ', socket.id)
    listenForUpdateRequests(socket)
  })
})
