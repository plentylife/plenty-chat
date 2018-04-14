import test from 'ava'
import {pushMessage} from '../../src/db/MessageTable'
import {nSQL} from 'nano-sql'
import {rateMessage} from '../../src/actions/RatingActions'
import {CommunityIdNotInferrable} from '../../src/utils/Error'
import {setCommunityOfChannel} from '../../src/db/ChannelTable'
import {CannotRateOwnMessage} from '../../src/events/RatingEvents'

const MSG_ID = 'tmid'
const AGENT_ID = 'uid'
const CHANNEL_ID = 'chid'
const COMMUNITY_ID = 'commid'

test.before(async t => {
  await nSQL().connect().then(() => {
    return pushMessage(MSG_ID, AGENT_ID, CHANNEL_ID)
  })
})

test('channel to community mapping is missing', async t => {
  await t.throws(async () => {
    await rateMessage(MSG_ID, AGENT_ID, 1, 2)
  }, CommunityIdNotInferrable)
})

test('cannot rate own message', async t => {
  await setCommunityOfChannel(CHANNEL_ID, COMMUNITY_ID)
  await t.throws(async () => {
    await rateMessage(MSG_ID, AGENT_ID, 1, 2)
  }, CannotRateOwnMessage)
})
