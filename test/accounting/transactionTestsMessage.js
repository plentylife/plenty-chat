import test from 'ava'
import {setupDb} from '../utils'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {makeTransactionOnMessage} from '../../src/actions/AccountingActions'
import {getWallet, setBalance} from '../../src/db/AgentWalletTable'
import {nSQL} from 'nano-sql'
import {getMessage} from '../../src/db/MessageTable'
import {sendMessage} from '../../src/actions/MessageActions'
import {setCommunityOfChannel} from '../../src/db/ChannelTable'
import {MESSAGE_TABLE} from '../../src/db/tableNames'

const AGENT_SENDER = 'afrom'
const AGENT_RECIPIENT = 'ato'
const COMMUNITY_ID = 'comid'
const CHANNEL_ID = 'chid'

test.before(async t => {
  await setupDb(t)
  await addAgentToCommunity(AGENT_SENDER, COMMUNITY_ID)
  await addAgentToCommunity(AGENT_RECIPIENT, COMMUNITY_ID)
  await setBalance(AGENT_SENDER, COMMUNITY_ID, 10)
  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  t.is(ws.balance, 10)
  t.is(wr.balance, 0)
})

test.serial('transaction without message existing', async t => {
  const amount = 10.0543
  const msgid = 'msgid'
  const res = await makeTransactionOnMessage(msgid, CHANNEL_ID, AGENT_RECIPIENT,
    AGENT_SENDER, COMMUNITY_ID, amount)

  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  const msg = await getMessage(msgid)

  t.is(ws.balance, -0.054)
  t.is(wr.balance, 10.054)
  t.is(msg.fundsCollected, 10.054)
  t.is(msg.channelId, CHANNEL_ID)
  t.is(msg.senderId, AGENT_RECIPIENT)

  t.true(res.status)
  t.falsy(res.value)
})

test.serial('second transaction on same message', async t => {
  const amount = 0.4
  const msgid = 'msgid'
  const res = await makeTransactionOnMessage(msgid, CHANNEL_ID, AGENT_RECIPIENT,
    AGENT_SENDER, COMMUNITY_ID, amount)

  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  const msg = await getMessage(msgid)
  const allMsg = await nSQL(MESSAGE_TABLE).query('select').exec()

  t.is(allMsg.length, 1)
  t.is(ws.balance, -0.454)
  t.is(wr.balance, 10.454)
  t.is(msg.fundsCollected, 10.454)
  t.is(msg.channelId, CHANNEL_ID)
  t.is(msg.senderId, AGENT_RECIPIENT)

  t.true(res.status)
  t.falsy(res.value)
})

test.serial('transaction on a message that already exists', async t => {
  const amount = 1
  const msgid = 'msgid2'
  await setBalance(AGENT_SENDER, COMMUNITY_ID, 1, true)
  await setCommunityOfChannel(CHANNEL_ID, COMMUNITY_ID)
  await sendMessage(AGENT_RECIPIENT, CHANNEL_ID, msgid)
  const res = await makeTransactionOnMessage(msgid, CHANNEL_ID, AGENT_RECIPIENT,
    AGENT_SENDER, COMMUNITY_ID, amount)

  let allMsg = await nSQL(MESSAGE_TABLE).query('select').exec()
  t.is(allMsg.length, 2)

  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  const msg = await getMessage(msgid)
  allMsg = await nSQL(MESSAGE_TABLE).query('select').exec()

  t.is(allMsg.length, 2)
  t.is(ws.balance, -0.454)
  t.is(wr.balance, 10.454)
  t.is(msg.fundsCollected, 1)
  t.is(msg.channelId, CHANNEL_ID)
  t.is(msg.senderId, AGENT_RECIPIENT)

  t.true(res.status)
  t.falsy(res.value)
})
