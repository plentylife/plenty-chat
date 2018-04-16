import {nSQL} from 'nano-sql/lib/index'
import test from 'ava/index'
import {pushEvent, getCommunityEvents, getEvents} from '../../src/db/EventTable'
import {DB_MODE} from '../../src/state/GlobalState'

const COMMUNITY_ID = 'comid'

console.log('DB Mode is', DB_MODE)

const INITIAL_TIME = new Date().getTime()

test.before(t => {
  return nSQL().connect().then(async (r) => {
    console.log('Connected to DB', r)
  })
})

test('select events after timestamp', async t => {
  t.plan(4)

  let event = JSON.parse('{"agentEventId":1,"communityId":"comid","senderId":"uid","eventType":"rating",' +
    '"payload":{"messageId":"tmid","rating":0}, "globalEventId": "uidseltime1"}')
  event.receivedFrom = new Set(['anton'])
  await pushEvent(event, true)

  let events = await getCommunityEvents(COMMUNITY_ID, INITIAL_TIME)
  let allEvents = await getEvents(INITIAL_TIME)
  t.true(allEvents.length > 0)
  t.true(events.map(e => (e.globalEventId)).includes('uidseltime1'))

  events = await getCommunityEvents(COMMUNITY_ID, new Date().getTime())
  allEvents = await getEvents(new Date().getTime())
  t.is(events.length, 0)
  t.is(allEvents.length, 0)
})
