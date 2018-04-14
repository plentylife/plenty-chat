import {nSQL} from 'nano-sql/lib/index'
import {getCommunity, setCommunityOfChannel} from '../src/db/ChannelTable'
import test from 'ava/index'
import {pushMessage} from '../src/db/MessageTable'
import {getCommunityOfMsg} from '../src/db'
import {pushEvent, selectAfterTimestamp} from '../src/db/EventTable'

const AGENT_ID = 'uid'
const COMMUNITY_ID = 'comid'
const CHANNEL_ID = 'chid'
const MSG_ID = 'msid'

nSQL().connect().then(async () => {
  const INITIAL_TIME = new Date().getTime()

  test.before('setting up channel to community mapping', async t => {
    await setCommunityOfChannel(CHANNEL_ID, COMMUNITY_ID)
    const c = await getCommunity(CHANNEL_ID)

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

    const event = JSON.parse('{"eventId":1,"communityId":"comid","senderId":"uid","eventType":"rating","payload":{"messageId":"tmid","rating":0}}')
    await pushEvent(event, true)

    let events = await selectAfterTimestamp(COMMUNITY_ID, INITIAL_TIME)
    events.forEach(e => {
      console.log('Event:', e)
    })
    t.is(events.length, 1)

    events = await selectAfterTimestamp(COMMUNITY_ID, new Date().getTime())
    t.is(events.length, 0)
  })
})