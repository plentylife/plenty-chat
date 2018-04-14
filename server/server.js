/* eslint-disable no-unused-expressions */

require('nano-sql').nSQL
require('nano-sqlite').nSQLiteAdapter
require('nano-sqlite').sqlite3
require('leveldown')
require('ws')
require('socket.io')
require('socket.io-client')

process.env.NODE_ENV = 'testperm'

console.log('NODE_ENV', process.env.NODE_ENV)

require('./server-lib')
