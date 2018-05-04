import test from 'ava'
import {setupDb} from '../utils'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {createChannel} from '../../src/actions/ChannelActions'
import {sendMessage} from '../../src/actions/MessageActions'
import {generateAllTableSyncMessages} from '../../src/sync/TableSync'

const AGENT_ID = 'uid'
const COMMUNITY_ID = 'comid'
const CHANNEL_ID = 'chid'
const MESSAGE_ID = 'mid'

test.before(async t => {
  await setupDb(t)

  await createChannel(AGENT_ID, CHANNEL_ID, COMMUNITY_ID)
  await addAgentToCommunity(AGENT_ID, COMMUNITY_ID)
  await sendMessage(AGENT_ID, CHANNEL_ID, MESSAGE_ID)
})

test.serial('all table entries should become sync messages', async t => {
  const msgs = await generateAllTableSyncMessages()
  msgs.forEach(m => console.log(m))
  t.pass()
})
