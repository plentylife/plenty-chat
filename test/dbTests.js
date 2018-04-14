import {nSQL} from 'nano-sql/lib/index'
import {getCommunity, setCommunityOfChannel} from '../src/db/ChannelTable'
import test from 'ava/index'
import {pushMessage} from '../src/db/MessageTable'
import {getCommunityOfMsg} from '../src/db'

const AGENT_ID = 'uid'
const COMMUNITY_ID = 'comid'
const CHANNEL_ID = 'chid'
const MSG_ID = 'msid'

nSQL().connect().then(async () => {
  test.before('setting up channel to community mapping', async t => {
    await setCommunityOfChannel(CHANNEL_ID, COMMUNITY_ID)
    const c = await getCommunity(CHANNEL_ID)

    t.is(c, COMMUNITY_ID)
  })

  test.before('setting up message', async t => {
    await pushMessage(MSG_ID, AGENT_ID, CHANNEL_ID)
  })

  test('testing ability to infer community of a message', async t => {
    const communityId = await getCommunityOfMsg(MSG_ID)
    t.is(communityId, COMMUNITY_ID)
  })
})
