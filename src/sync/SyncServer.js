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
console.log('DB name', process.env.DB_NAME)
console.log('Socket debug', process.env.DEBUG)

io.on('connection', (socket) => {
  console.log('Server connected to ', socket.id)
  socket.on('request-update', (request) => {
    console.log('Server is asked for update', request)
  })
})
