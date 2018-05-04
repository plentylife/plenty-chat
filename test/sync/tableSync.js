import test from 'ava'
import {dropAll, setupDb} from '../utils'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {createChannel} from '../../src/actions/ChannelActions'
import {sendMessage} from '../../src/actions/MessageActions'
import {generateAllTableSyncMessages, receiveTableSyncMessage} from '../../src/sync/TableSync'
import {getCommunityOfChannel} from '../../src/db/ChannelTable'
import {getAllWallets} from '../../src/db/AgentWalletTable'
import {getCommunityBalance} from '../../src/db/CommunityTable'

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

let messages = []

test.serial('all table entries should become sync messages', async t => {
  messages = await generateAllTableSyncMessages()
  messages.forEach(m => console.log(m))
  t.pass()
})

test.serial('tables should be updated on the other end', async t => {
  await dropAll()
  await Promise.all(messages.map(m => {
    receiveTableSyncMessage(m)
  }))

  const ch = await getCommunityOfChannel(CHANNEL_ID)
  const ws = await getAllWallets()
  const comBal = await getCommunityBalance(COMMUNITY_ID)
  t.is(COMMUNITY_ID, ch)
  t.is(ws.length, 1)
  t.is(ws[0].balance, -1)
  t.is(comBal, 1)
})