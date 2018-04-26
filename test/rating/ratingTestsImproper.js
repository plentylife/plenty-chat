import test from 'ava'
import {getMessage, MESSAGE_TABLE, pushMessage} from '../../src/db/MessageTable'
import {nSQL} from 'nano-sql'
import {rateMessage} from '../../src/actions/RatingActions'
import {CommunityIdNotInferrable} from '../../src/utils/Error'
import {setCommunityOfChannel} from '../../src/db/ChannelTable'
import {CannotRateOwnMessage} from '../../src/events/RatingEvents'
import {setCurrentCommunityId} from '../../src/state/GlobalState'
import {getCommunitySharePoints} from '../../src/db/AgentWalletTable'
import {DEFAULT_COMMUNITY_SHARE_POINTS} from '../../src/accounting/AccountingGlobals'
import {setupDb} from '../utils'
import {addAgentToCommunity} from '../../src/actions/AgentActions'

const MSG_ID = 'tmid'
const AGENT_ID = 'uid'
const AGENT_RATER_ID = 'rater'
const CHANNEL_ID = 'chid'
const COMMUNITY_ID = 'commid'

test.before(async t => {
  await setupDb(t)
  await nSQL().connect().then(async () => {
    await addAgentToCommunity(AGENT_ID, COMMUNITY_ID)
    await addAgentToCommunity(AGENT_RATER_ID, COMMUNITY_ID)
    await pushMessage(MSG_ID, AGENT_ID, CHANNEL_ID)
  })
})

test.serial('channel to community mapping is missing', async t => {
  setCurrentCommunityId(null)
  // the first should throw
  await t.throws(async () => {
    await rateMessage(MSG_ID, AGENT_ID, 1, 2)
  }, CommunityIdNotInferrable)

  setCurrentCommunityId(COMMUNITY_ID)
  // but this one should be fine, because it should use the current community id
  await rateMessage(MSG_ID, AGENT_RATER_ID, 2, 2)

  const raterPoints = await getCommunitySharePoints(AGENT_RATER_ID, COMMUNITY_ID)
  const msgSenderPoints = await getCommunitySharePoints(AGENT_ID, COMMUNITY_ID)
  t.is(raterPoints, DEFAULT_COMMUNITY_SHARE_POINTS)
  t.is(msgSenderPoints, 100 + DEFAULT_COMMUNITY_SHARE_POINTS)
})

test.serial('cannot rate own message', async t => {
  await setCommunityOfChannel(CHANNEL_ID, COMMUNITY_ID)
  const error = await rateMessage(MSG_ID, AGENT_ID, 1, 2)
  t.true(error instanceof CannotRateOwnMessage)
})

test.serial('rating witout the message in db', async t => {
  await nSQL(MESSAGE_TABLE).query('drop').exec()
  t.is(await getMessage(MSG_ID), null)

  await rateMessage('non-existent-msg', AGENT_RATER_ID, 2, 2, AGENT_ID)

  const raterPoints = await getCommunitySharePoints(AGENT_RATER_ID, COMMUNITY_ID)
  const msgSenderPoints = await getCommunitySharePoints(AGENT_ID, COMMUNITY_ID)
  t.is(raterPoints, DEFAULT_COMMUNITY_SHARE_POINTS)
  t.is(msgSenderPoints, 2 * 100 + DEFAULT_COMMUNITY_SHARE_POINTS)
})
