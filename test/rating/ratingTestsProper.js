import test from 'ava'
import {pushMessage} from '../../src/db/MessageTable'
import {nSQL} from 'nano-sql'
import {rateMessage} from '../../src/actions/RatingActions'
import {getRating} from '../../src/db/RatingTable'
import apEq from 'approximately-equal'
import {setCommunityOfChannel} from '../../src/db/ChannelTable'

console.log('NODE_ENV is ', process.env.NODE_ENV)

const MSG_ID = 'tmid'
const AGENT_ID = 'uid'
const AGENT_SENDER_ID = 'sender'
const CHANNEL_ID = 'chid'
const COMMUNITY_ID = 'comid'
const NUM_STARS = 3

async function addMessage (t, rating, expected) {
  t.plan(1)

  await rateMessage(MSG_ID, AGENT_ID, rating, NUM_STARS)
  const ratingInDb = await getRating(MSG_ID, AGENT_ID)
  t.true(apEq(ratingInDb, expected, 0.01))
}
addMessage.title = (providedTitle, input, expected) => `${providedTitle} ${input} = ${expected}`.trim()

test.before(async t => {
  await nSQL().connect().then(async () => {
    await setCommunityOfChannel(CHANNEL_ID, COMMUNITY_ID)
    await pushMessage(MSG_ID, AGENT_SENDER_ID, CHANNEL_ID)
  })
})

test.serial('adding message rating', addMessage, 1, 0)
test.serial('adding message rating', addMessage, 2, 0.5)
test.serial('adding message rating', addMessage, 3, 1)

test.serial('adding inappropriate message rating', async t => {
  const MSG_ID = 'fail1'
  await t.throws(async () => {
    await rateMessage(MSG_ID, AGENT_ID, 0, NUM_STARS)
  })
  t.is(await getRating(MSG_ID, AGENT_ID), null)
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
})
