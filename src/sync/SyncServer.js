import {DB_MODE} from '../state/GlobalState'
import {nSQL} from 'nano-sql/lib/index'
import {EVENT_TABLE} from '../db/EventTable'

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

nSQL().connect().then(async (r) => {
  console.log('Connected to DB', r)

  await nSQL(EVENT_TABLE).query('select').exec().then(r => {
    r.forEach(e => console.log(e))
  })
})

io.on('connection', (socket) => {
  console.log('Server connected to ', socket)
  socket.on('request-update', (request) => {
    console.log('Server asked for update', request)
  })
})
