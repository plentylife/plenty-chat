import {nSQL} from 'nano-sql'
import {nSQLiteAdapter} from 'nano-sqlite/index'
import '../../src/db/index'
import {EVENT_TABLE} from '../../src/db/EventTable'
import {test} from 'ava'
import {applyToAllDbs} from '../utils'
import {AGENT_TABLE} from '../../src/db/tableNames'
import fs from 'fs'

let adapter = null

function dumpTable (dir, name) {
// eslint-disable-next-line new-cap
  adapter = new nSQLiteAdapter(dir + name + '.sqlite3')
  applyToAllDbs((t) => {
    t.config({mode: adapter})
  })

  return nSQL().connect().then(async db => {
    const dump = await nSQL().rawDump()
    await new Promise(resolve => {
      fs.writeFile(dir + name + '.rawdump', JSON.stringify(dump), resolve)
    })

    return nSQL(EVENT_TABLE).query('select').exec()
  })
}

export function importTable (dir, name) {
  return nSQL().connect().then(async db => {
    const data = await new Promise(resolve => {
      fs.readFile(dir + name + '.rawdump', 'utf8', (e, d) => {
        resolve(d)
      })
    })

    await nSQL().rawImport(JSON.parse(data))
  })
}

const dir = '/home/anton/code/plenty-chat/test/db/test-data/'
const name = 'events-not-maching-state-in-server'

// test.serial('dumping table', async t => {
//   const rows = await dumpTable(dir, name)
//   t.true(rows.length > 0)
// })

// test.serial('importing table', async t => {
//   await importTable(dir, name)
//   const rows = await nSQL(EVENT_TABLE).query('select').exec()
//   t.true(rows.length > 0)
// })
