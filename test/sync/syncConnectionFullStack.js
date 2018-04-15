import test from 'ava'
import {startSync} from '../../src/sync/SyncClient'
import '../../src/db/index'
import {nSQL} from 'nano-sql'
import {sendMessage} from '../../src/actions/MessageActions'
import {setCommunityOfChannel} from '../../src/db/ChannelTable'
import {rateMessage} from '../../src/actions/RatingActions'

const AGENT_ID = 'uid'
const AGENT_RATER_ID = 'uid'
const COMMUNITY_ID = 'comid'
const CHANNEL_ID = 'chid'
const MSG_ID = 'mid'

test.before(t => {
  return nSQL().connect().then(async () => {
    await setCommunityOfChannel(CHANNEL_ID, COMMUNITY_ID)
    await sendMessage(AGENT_ID, CHANNEL_ID, MSG_ID)
    await rateMessage(MSG_ID, AGENT_RATER_ID, 2, 2)
  })
})

test.serial('full setup on onConnect', t => {
  startSync(['http://localhost:3000'])

  return timeout(5000).then(() => t.pass())
})

function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
