import {nSQL} from 'nano-sql/lib/index'
import {getCommunityOfChannel, setCommunityOfChannel} from '../../src/db/ChannelTable'
import test from 'ava/index'
import {pushMessage} from '../../src/db/MessageTable'
import {getCommunityOfMsg} from '../../src/db/index'
import {pushEvent, getCommunityEvents, getEvent, getEvents} from '../../src/db/EventTable'
import {DB_MODE} from '../../src/state/GlobalState'
import {dumpPeerSyncTable, getSyncedUpTo, getSyncedUpToInAll, logSync} from '../../src/db/PeerSyncTable'

const AGENT_ID = 'uid'
const COMMUNITY_ID = 'comid'
const CHANNEL_ID = 'chid'
const MSG_ID = 'msid'

console.log('DB Mode is', DB_MODE)

nSQL().connect().then(async (r) => {
  console.log('Connected to DB', r)
  const INITIAL_TIME = new Date().getTime()

  test.before('setting up channel to community mapping', async t => {
    await setCommunityOfChannel(CHANNEL_ID, COMMUNITY_ID)
    const c = await getCommunityOfChannel(CHANNEL_ID)

    t.is(c, COMMUNITY_ID)
  })

  test.before('setting up message', async t => {
    await pushMessage(MSG_ID, AGENT_ID, CHANNEL_ID)
  })

  test('able to infer community of a message', async t => {
    const communityId = await getCommunityOfMsg(MSG_ID)
    t.is(communityId, COMMUNITY_ID)
  })

  test.todo('proper format of event entries')

  test('select events after timestamp', async t => {
    t.plan(2)

    let event = JSON.parse('{"agentEventId":1,"communityId":"comid","senderId":"uid","eventType":"rating",' +
      '"payload":{"messageId":"tmid","rating":0}, "globalEventId": "uidseltime1"}')
    event.receivedFrom = new Set(['anton'])
    await pushEvent(event, true)

    let events = await getCommunityEvents(COMMUNITY_ID, INITIAL_TIME)
    events.forEach(e => {
      console.log('Event:', e)
    })
    t.true(events.map(e => (e.globalEventId)).includes('uidseltime1'))

    events = await getCommunityEvents(COMMUNITY_ID, new Date().getTime())
    t.is(events.length, 0)
  })

  test('create and update event', async t => {
    let event = JSON.parse('{"agentEventId":1,"communityId":"comid","senderId":"uid","eventType":"rating",' +
      '"payload":{"messageId":"tmid","rating":0}, "globalEventId": "uidcu1"}')
    event.receivedFrom = new Set(['anton'])

    await pushEvent(event, true)
    let e = await getEvent('uidcu1')

    t.deepEqual(e.receivedFrom, ['anton'])

    event.communityId = 'other'
    event.receivedFrom = new Set(['john'])
    await pushEvent(event, true)
    e = await getEvent('uidcu1')

    t.deepEqual(e.receivedFrom, ['anton', 'john'])
    t.is(e.communityId, 'comid')

    event.receivedFrom = null
    await pushEvent(event, true)
    e = await getEvent('uidcu1')

    t.deepEqual(e.receivedFrom, ['anton', 'john'])
    t.is(e.communityId, 'comid')
  })

  test('Sync logs should give accurate information', async t => {
    const CID2 = 'comid2'
    const AID2 = 'agentid2'

    await logSync(AGENT_ID, COMMUNITY_ID, 10)
    t.is(await getSyncedUpToInAll(AGENT_ID), 10)
    t.is(await getSyncedUpTo(AGENT_ID, COMMUNITY_ID), 10)
    t.is(await getSyncedUpTo(AGENT_ID, CID2), 0)

    console.log('block 1 end')

    await logSync(AGENT_ID, CID2, 9)
    t.is(await getSyncedUpToInAll(AGENT_ID), 10)
    t.is(await getSyncedUpTo(AGENT_ID, COMMUNITY_ID), 10)
    t.is(await getSyncedUpTo(AGENT_ID, CID2), 9)

    console.log('block 2 end')

    await logSync(AID2, CID2, 15)
    t.is(await getSyncedUpToInAll(AGENT_ID), 10)
    t.is(await getSyncedUpTo(AGENT_ID, COMMUNITY_ID), 10)
    t.is(await getSyncedUpTo(AGENT_ID, CID2), 9)

    let dump = await dumpPeerSyncTable()
    dump.forEach(r => console.log(r))
    console.log(`dumped ${dump.length} records`)

    console.log('block 3 end')

    await logSync(AGENT_ID, CID2, 15)
    dump = await dumpPeerSyncTable()
    dump.forEach(r => console.log(r))
    console.log(`dumped ${dump.length} records`)

    t.is(await getSyncedUpToInAll(AGENT_ID), 15)
    t.is(await getSyncedUpTo(AGENT_ID, COMMUNITY_ID), 10)
    t.is(await getSyncedUpTo(AGENT_ID, CID2), 15)
  })

  test('events are sorted by timestamp', async t => {
    const COMID = 'timecid'

    let event = JSON.parse('{"agentEventId":1,"communityId":"timecid","senderId":"uid","eventType":"rating",' +
      '"payload":{"messageId":"tmid","rating":0}, "globalEventId": "uidtime1"}')
    await pushEvent(event, true)

    event = JSON.parse('{"agentEventId":2,"communityId":"timecid","senderId":"uid","eventType":"rating",' +
      '"payload":{"messageId":"tmid","rating":0}, "globalEventId": "uidtime2"}')
    await pushEvent(event, true)

    let events = await getEvents(0)
    let testFlag = true
    let lastTime = 0
    events.forEach(e => {
      if (e.timestamp < lastTime) testFlag = false
      lastTime = e.timestamp
    })
    t.true(testFlag)

    events = await getCommunityEvents(COMID, 0)
    t.true(events[0].timestamp < events[1].timestamp)
  })
})
