import {test} from 'ava'
import {EVENT_TABLE} from '../../../src/db/EventTable'
import {nSQL} from 'nano-sql/lib/index'
import {importTable} from '../utils'
import {DB_MODE} from '../../../src/state/GlobalState'
import {dropAll} from '../../utils'
import {AGENT_WALLET_TABLE, getAllWallets} from '../../../src/db/AgentWalletTable'
import {handleEvent, lastEvent} from '../../../src/events'

const dir = '/home/anton/code/plenty-chat/test/db/test-data/'
const name = 'events-not-maching-state-in-agent'

function getEvents () {
  return nSQL(EVENT_TABLE).query('select').exec()
}

let events = null

test.before(async t => {
  t.is(DB_MODE, 'TEMP')

  await importTable(dir, name)
  events = await getEvents()
  t.true(events.length > 0)

  await dropAll()
  const rows = await getEvents()
  t.true(rows.length === 0)
  t.true((await nSQL(AGENT_WALLET_TABLE).query('select').exec()).length === 0)
})

test('processing events to state', async t => {
  let existing = []
  let failed = 0
  let ps = events.map(e => {
    return handleEvent(e).then(r => {
      if (r.code === 'EXISTS') {
        existing.push(e.globalEventId)
      }
      if (r === false) failed++
    })
  })
  await Promise.all(ps)
  const ws = await getAllWallets()

  console.log('All events', events.length)
  console.log('Existing', existing.length)
  console.log('Failed', failed)

  t.is(ws.length, 9)

  ws.forEach(w => {
    console.log(w)
  })
})
