import {DB_MODE} from '../state/GlobalState'

console.log('Starting server')

const server = require('http').createServer()
const io = require('socket.io')(server, {
  serveClient: false // do not serve the client file, in that case the brfs loader is not needed
})
const port = process.env.PORT || 3000

server.listen(port, () => console.log('server listening on port ' + port))

console.log('Node env', process.env.NODE_ENV)
console.log('DB mode', DB_MODE)

io.on('connection', (socket) => {
  console.log('Server connected to ', socket)
  socket.on('request-update', (request) => {
    console.log('Server asked for update', request)
  })
})
