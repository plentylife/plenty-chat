import {nSQL} from 'nano-sql'

import '../../src/db/MessageTable'

import {EVENT_TABLE} from '../../src/db/EventTable'
import {DB_MODE} from '../../src/state/GlobalState'

console.log('DB Mode is', DB_MODE)

nSQL().connect().then(async (r) => {
  console.log('Connected to DB', r)

  await nSQL(EVENT_TABLE).query('select').exec().then(r => {
    r.forEach(e => console.log(e))
  })
})
