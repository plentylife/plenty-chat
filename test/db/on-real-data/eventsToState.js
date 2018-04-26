import {test} from 'ava'
import {EVENT_TABLE, getEvents} from '../../../src/db/EventTable'
import {nSQL} from 'nano-sql/lib/index'
import {importTable} from '../utils'
import {DB_MODE} from '../../../src/state/GlobalState'
import {dropAll, waitAndCheck} from '../../utils'
import {AGENT_WALLET_TABLE, getAllWallets} from '../../../src/db/AgentWalletTable'
import {_backlogEvent, _isConsuming} from '../../../src/sync'
import {COMMUNITY_TABLE} from '../../../src/db/CommunityTable'
import {COMMUNITY_POT_SPLIT} from '../../../src/events/AccountingEvents'
import {calculateCommunityPotSplit} from '../../../src/accounting/CommunityPot'
import {splitAllCommunityPots} from '../../../src/actions/AccountingActions'

const dir = '/home/anton/code/plenty-chat/test/db/test-data/'
const name = 'events-not-maching-state-in-agent'

function _getAllEvents () {
  return nSQL(EVENT_TABLE).query('select').exec()
}

let events = null

const COMMUNITY_ID = 'dimtyoqcb7dutj5kxxxh9s8y9y'

test.before(async t => {
  t.is(DB_MODE, 'TEMP')

  await importTable(dir, name)
  events = await _getAllEvents()
  t.true(events.length > 0)

  await dropAll()
  const rows = await _getAllEvents()
  t.true(rows.length === 0)
  t.true((await nSQL(AGENT_WALLET_TABLE).query('select').exec()).length === 0)
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

  await waitAndCheck(() => {
    return !_isConsuming
  })

  const ws = await getAllWallets()

  console.log('\n\n\nSync\n=======================\n')
  console.log('All events', events.length)
  console.log('Processed', passedIn)
  ws.forEach(w => {
    console.log(w)
  })
  await nSQL(COMMUNITY_TABLE).query('select').exec().then(rs => {
    rs.forEach(r => console.log(r))
  })

  t.is(ws.length, 9)
})

test.serial('testing the accounting split function', async t => {
  const split = await calculateCommunityPotSplit(COMMUNITY_ID, 0)
  console.log('Split function gave')
  console.log(split)
  t.true(split.length === 7)
})

test.serial('do the split', async t => {
  const now = new Date().getTime()
  await splitAllCommunityPots()
  const afterSplit = await getEvents(now)
  console.log('Split events')
  afterSplit.forEach(se => {
    console.log(se.communityId)
    console.log(se.payload)
    console.log('')
  })
})

test.skip('looking at pot splits', async t => {
  console.log('\nSplits\n=======================\n')

  let payloadSizes = {}
  let splits = events.filter(e => (e.eventType === COMMUNITY_POT_SPLIT))
  splits = splits.filter(e => (e.communityId === COMMUNITY_ID))

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
