import test from 'ava'
import {pushMessage} from '../../src/db/MessageTable'
import {nSQL} from 'nano-sql'
import {rateMessage} from '../../src/actions/RatingActions'
import {CommunityIdNotInferrable} from '../../src/utils/Error'

const MSG_ID = 'tmid'
const AGENT_ID = 'uid'
const CHANNEL_ID = 'chid'

test.before(async t => {
  await nSQL().connect().then(() => {
    return pushMessage(MSG_ID, AGENT_ID, CHANNEL_ID)
  })
})

test('channel to community mapping is missing', async t => {
  await t.throws(async () => {
    await rateMessage(MSG_ID, AGENT_ID, 1, 1)
  }, CommunityIdNotInferrable)
})
