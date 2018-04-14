/* eslint-disable no-unused-expressions */

require('nano-sql').nSQL
require('nano-sqlite').nSQLiteAdapter
require('nano-sqlite').sqlite3
require('leveldown')

const test = require('../../build-tests/dbDumpsModule')

console.log(test)
