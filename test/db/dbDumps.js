import {nSQL} from 'nano-sql'
import test from 'ava'

import '../../src/db/MessageTable'

import {EVENT_TABLE} from '../../src/db/EventTable'
import {DB_MODE} from '../../src/state/GlobalState'

console.log('DB Mode is', DB_MODE)

nSQL().connect().then(async (r) => {
  console.log('Connected to DB', r)

  test('there should be records', async t => {
    let flag = false
    await nSQL(EVENT_TABLE).query('select').exec().then(r => {
      flag = r.length > 0
      r.forEach(e => console.log(e))
    })
    t.true(flag)
  })
})