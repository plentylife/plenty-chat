import {test} from 'ava'
import {EVENT_TABLE, getEvents} from '../../../src/db/EventTable'
import {nSQL} from 'nano-sql/lib/index'
import {importTable} from '../utils'
import {DB_MODE, setCurrentAgentId} from '../../../src/state/GlobalState'
import {dropAll, waitAndCheck} from '../../utils'
import {AGENT_WALLET_TABLE, getAllWallets} from '../../../src/db/AgentWalletTable'
import {_backlogEvent, _eventBacklog, _isConsumingOutgoingQueue} from '../../../src/sync'
import {COMMUNITY_TABLE} from '../../../src/db/CommunityTable'
import {COMMUNITY_POT_SPLIT} from '../../../src/events/AccountingEvents'
import {calculateCommunityPotSplit} from '../../../src/accounting/CommunityPot'
import {splitAllCommunityPots} from '../../../src/actions/AccountingActions'
import {_handleEventErrors, handledCount} from '../../../src/events'

const dir = '/home/anton/code/plenty-chat/test/db/test-data/'
const name = 'events-not-maching-state-in-server'

function _getAllEvents () {
  return nSQL(EVENT_TABLE).query('select').orderBy({timestamp: 'asc'}).exec()
}

let events = null

global.nsql = nSQL
const COMMUNITY_ID = 'dimtyoqcb7dutj5kxxxh9s8y9y'
setCurrentAgentId('server-default-id')

test.before(async t => {
  t.is(DB_MODE, 'TEMP')
  t.is(process.env.NODE_ENV, 'test')

  await importTable(dir, name)
  events = await _getAllEvents()
  t.true(events.length > 0)

  await dropAll()
  const rows = await _getAllEvents()
  t.true(rows.length === 0)
  t.true((await nSQL(AGENT_WALLET_TABLE).query('select').exec()).length === 0)

  const eid = events.filter(e => (e.senderId === 'up1g6iyezbdw9ptby8ts4hrs9w')).map(e => (e.globalEventId))
  global.testEvents = events
})

test.serial('passing events into sync', async t => {
  const peer = {
    agentId: 'fakeid'
  }
  let passedIn = 0

  events.forEach(e => {
    _backlogEvent(e, peer)
    passedIn += 1
  })

  // const ebid = _eventBacklog.map(e => (e.globalEventId))
  // const eid = events.map(e => (e.globalEventId))
  // t.deepEqual(events, _eventBacklog)

  await waitAndCheck(() => {
    return !_isConsumingOutgoingQueue
  })

  console.log('\n\n\nSync\n=======================\n')
  console.log('All events', events.length)
  console.log('Processed', passedIn)
  console.log('Actually handled', handledCount)
  console.log('Errors', _handleEventErrors)
  t.pass()
})

test.serial('looking at accounts', async t => {
  console.log('\n\nWallets\n=======================')
  await nSQL(AGENT_WALLET_TABLE).query('select').exec().then(w => {
    w.forEach(r => console.log(r))
  })
  console.log('\nCommunity\n=======================')
  await nSQL(COMMUNITY_TABLE).query('select').exec().then(rs => {
    rs.forEach(r => console.log(r))
  })

  t.pass()
})

test.serial('order of events', async t => {
  console.log('\n\nEvent order\n=======================')
  await nSQL(EVENT_TABLE).query('select', ['globalEventId', 'timestamp']).orderBy({timestamp: 'asc'}).exec().then(db => {
    const eid = events.map(e => (e.globalEventId))
    const dbeid = db.map(e => (e.globalEventId))
    t.deepEqual(eid, dbeid)
  })
})

test.serial('splitting pot', async t => {
  console.log('\n\nPot split\n=======================')
  await splitAllCommunityPots()

  t.pass()
})

test.serial('looking at timestamps', async t => {
  console.log('\n\nEvent data\n=======================')
  await nSQL(EVENT_TABLE).query('select', ['MIN(timestamp) AS mt']).exec().then(r => {
    console.log(r[0].mt)
    console.log(r[0].mt - 1524749468216)
  })

  t.pass()
})
// "up1g6iyezbdw9ptby8ts4hrs9w"
