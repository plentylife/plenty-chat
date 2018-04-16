import test from 'ava'
import {startSync} from '../../src/sync/SyncClient'
import '../../src/db/index'
import {nSQL} from 'nano-sql'
import {sendMessage} from '../../src/actions/MessageActions'
import {rateMessage} from '../../src/actions/RatingActions'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {createChannel} from '../../src/actions/ChannelActions'
import {getCommunityOfChannel} from '../../src/db/ChannelTable'
import {getRating} from '../../src/db/RatingTable'
import {getMessage} from '../../src/db/MessageTable'

const AGENT_ID = 'uid'
const AGENT_RATER_ID = 'rater_uid'
const COMMUNITY_ID = 'comid'
const CHANNEL_ID = 'chid'
const MSG_ID = 'mid'

test.before(async t => {
  await nSQL().connect()

  await addAgentToCommunity(AGENT_ID, COMMUNITY_ID)
  await createChannel(AGENT_ID, CHANNEL_ID, COMMUNITY_ID)
  t.is(await getCommunityOfChannel(CHANNEL_ID), COMMUNITY_ID)
  await sendMessage(AGENT_ID, CHANNEL_ID, MSG_ID)
  const msg = await getMessage(MSG_ID)
  t.is(msg.id, MSG_ID)
  await rateMessage(MSG_ID, AGENT_RATER_ID, 2, 2)
  t.is(await getRating(MSG_ID, AGENT_RATER_ID), 1)
})

test.serial('full setup on onConnect', t => {
  startSync(['http://localhost:3000'])

  return timeout(5000).then(() => t.pass())
})

function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
