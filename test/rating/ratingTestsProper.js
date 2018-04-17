import test from 'ava'
import {pushMessage} from '../../src/db/MessageTable'
import {nSQL} from 'nano-sql'
import {rateMessage} from '../../src/actions/RatingActions'
import {getRating} from '../../src/db/RatingTable'
import apEq from 'approximately-equal'
import {setCommunityOfChannel} from '../../src/db/ChannelTable'
import {getCommunitySharePoints} from '../../src/db/AgentWalletTable'
import {addAgentToCommunity} from '../../src/actions/AgentActions'

console.log('NODE_ENV is ', process.env.NODE_ENV)

const MSG_ID = 'tmid'
const AGENT_ID = 'uid'
const AGENT_SENDER_ID = 'sender'
const CHANNEL_ID = 'chid'
const COMMUNITY_ID = 'comid'
const NUM_STARS = 3

async function testMessage (t, rating, expected) {
  t.plan(3)

  await rateMessage(MSG_ID, AGENT_ID, rating, NUM_STARS)
  const ratingInDb = await getRating(MSG_ID, AGENT_ID)
  const raterPoints = await getCommunitySharePoints(AGENT_ID, COMMUNITY_ID)
  const msgSenderPoints = await getCommunitySharePoints(AGENT_SENDER_ID, COMMUNITY_ID)
  console.log('community share points', msgSenderPoints)
  t.is(raterPoints, 0)
  t.is(msgSenderPoints, Math.pow(expected, 2) * 100)
  t.true(apEq(ratingInDb, expected, 0.01))
}
testMessage.title = (providedTitle, input, expected) => `${providedTitle} ${input} = ${expected}`.trim()

test.before(async t => {
  await nSQL().connect().then(async () => {
    await addAgentToCommunity(AGENT_ID, COMMUNITY_ID)
    await addAgentToCommunity(AGENT_SENDER_ID, COMMUNITY_ID)
    await setCommunityOfChannel(CHANNEL_ID, COMMUNITY_ID)
    await pushMessage(MSG_ID, AGENT_SENDER_ID, CHANNEL_ID)
  })
})

test.serial('adding message rating', testMessage, 1, 0)
test.serial('adding message rating', testMessage, 2, 0.5)
test.serial('adding message rating', testMessage, 3, 1)

test.serial('adding inappropriate message rating', async t => {
  const MSG_ID = 'fail1'
  await t.throws(async () => {
    await rateMessage(MSG_ID, AGENT_ID, 0, NUM_STARS)
  })
  t.is(await getRating(MSG_ID, AGENT_ID), null)

  const raterPoints = await getCommunitySharePoints(AGENT_ID, COMMUNITY_ID)
  const msgSenderPoints = await getCommunitySharePoints(AGENT_SENDER_ID, COMMUNITY_ID)
  t.is(raterPoints, 0)
  t.is(msgSenderPoints, 100)
})

test.serial('wrong star setup', async t => {
  const MSG_ID = 'fail2'
  await t.throws(async () => {
    await rateMessage(MSG_ID, AGENT_ID, 1, 0)
  })
  await t.throws(async () => {
    await rateMessage(MSG_ID, AGENT_ID, 2, 1)
  })
  t.is(await getRating(MSG_ID, AGENT_ID), null)

  const raterPoints = await getCommunitySharePoints(AGENT_ID, COMMUNITY_ID)
  const msgSenderPoints = await getCommunitySharePoints(AGENT_SENDER_ID, COMMUNITY_ID)
  t.is(raterPoints, 0)
  t.is(msgSenderPoints, 100)
})
