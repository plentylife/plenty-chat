import {test} from 'ava'
import {EVENT_TABLE} from '../../../src/db/EventTable'
import {nSQL} from 'nano-sql/lib/index'
import {importTable} from '../utils'
import {DB_MODE} from '../../../src/state/GlobalState'
import {dropAll, waitAndCheck} from '../../utils'
import {AGENT_WALLET_TABLE, getAllWallets} from '../../../src/db/AgentWalletTable'
import {handleEvent, lastEvent} from '../../../src/events'
import {_backlogEvent, _isConsuming} from '../../../src/sync'
import {COMMUNITY_TABLE} from '../../../src/db/CommunityTable'
import {COMMUNITY_POT_SPLIT} from '../../../src/events/AccountingEvents'

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

test.skip('passing events into sync', async t => {
  const peer = {
    agentId: 'fakeid'
  }
  let existing = []
  let failed = 0
  let passedIn = 0

  // events = events.slice(0, 4)
  // t.is(events.length, 4)
  events.forEach(e => {
    _backlogEvent(e, peer)
    passedIn += 1
  })

  await waitAndCheck(() => {
    return !_isConsuming
  })

  const ws = await getAllWallets()

  console.log('\n\n\n=======================\n\n\n')
  console.log('All events', events.length)
  console.log('Processed', passedIn)
  // console.log('Existing', existing.length)
  // console.log('Failed', failed)
  ws.forEach(w => {
    console.log(w)
  })
  await nSQL(COMMUNITY_TABLE).query('select').exec().then(rs => {
    rs.forEach(r => console.log(r))
  })

  t.is(ws.length, 9)
})

test.serial('looking at pot splits', async t => {
  console.log('\nSplits\n=======================\n')

  let payloadSizes = {}
  let splits = events.filter(e => (e.eventType === COMMUNITY_POT_SPLIT))
  splits = splits.filter(e => (e.communityId === 'dimtyoqcb7dutj5kxxxh9s8y9y'))

  splits.forEach(s => {
    console.log(s)
  })

  splits.forEach(split => {
    let ss = payloadSizes[split.communityId] || new Set()
    const size = split.payload.length
    ss.add(size)
    payloadSizes[split.communityId] = ss
  })

  console.log('Payload Sizes', payloadSizes)

  // splits.forEach(s => {
  //   console.log(s)
  // })
})

// test('processing events to state', async t => {
//   let existing = []
//   let failed = 0
//   // let ps = events.map(e => {
//   let e = events.shift()
//   while (e) {
//     await handleEvent(e).then(r => {
//       if (r.code === 'EXISTS') {
//         existing.push(e.globalEventId)
//       }
//       if (r === false) {
//         failed += 1
//       }
//     })
//     e = events.shift()
//   }
//
//   // })
//   // await Promise.all(ps)
//   const ws = await getAllWallets()
//
//   console.log('All events', events.length)
//   console.log('Existing', existing.length)
//   console.log('Failed', failed)
//
//   t.is(ws.length, 9)
//
//   ws.forEach(w => {
//     console.log(w)
//   })
// })
