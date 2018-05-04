import test from 'ava'
import {nSQL} from 'nano-sql'
import {DB_MODE} from '../src/state/GlobalState'
import {createChannel} from '../src/actions/ChannelActions'
import {getCommunityBalance, setCommunityBalance} from '../src/db/CommunityTable'
import {getCommunityOfChannel} from '../src/db/ChannelTable'

console.log('DB Mode is', DB_MODE)

const AGENT_ID = 'uid'
const COMMUNITY_ID = 'comid'
const CHANNEL_ID = 'chid'

test.before(t => {
  t.is(DB_MODE, 'TEMP')
  return nSQL().connect()
})

test.serial('adding channel /hack creates community as well/ ', async t => {
  const ares = await createChannel(AGENT_ID, CHANNEL_ID, COMMUNITY_ID)
  t.true(ares)

  const cb = await getCommunityBalance(COMMUNITY_ID)
  t.is(cb, 0)

  t.is(COMMUNITY_ID, await getCommunityOfChannel(CHANNEL_ID))
})

test.serial('existing community should not be affected', async t => {
  await setCommunityBalance(COMMUNITY_ID, 10)
  let cb = await getCommunityBalance(COMMUNITY_ID)
  t.is(cb, 10)

  const ares = await createChannel(AGENT_ID, CHANNEL_ID, COMMUNITY_ID, /* force */ true)
  t.true(ares)

  cb = await getCommunityBalance(COMMUNITY_ID)
  t.is(cb, 10)
})

test.serial('creating a channel a second time should not send an event', async t => {
  // should not be sending a secondary event
  const second = await createChannel(AGENT_ID, CHANNEL_ID, COMMUNITY_ID)

  t.is(second, null)
})
