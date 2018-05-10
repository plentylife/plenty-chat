import test from 'ava'
import {setupDb} from '../utils'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {makeTransaction} from '../../src/actions/AccountingActions'
import {getWallet, setBalance} from '../../src/db/AgentWalletTable'
import {NOT_ENOUGH_FUNDS, RECIPIENT_DOES_NOT_EXIST} from '../../src/utils/UserErrors'
import {DEFAULT_CREDIT_LIMIT} from '../../src/accounting/AccountingGlobals'
import {Decimal} from 'decimal.js'

const TRANSACTION_TYPE = 'peer'

const AGENT_SENDER = 'afrom'
const AGENT_RECIPIENT = 'ato'
const COMMUNITY_ID = 'comid'

test.before(async t => {
  await setupDb(t)
  await addAgentToCommunity(AGENT_SENDER, COMMUNITY_ID)
  await setBalance(AGENT_SENDER, COMMUNITY_ID, 100)
  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  t.is(ws.balance, 100)
  t.is(wr, null)
  // addAgentToCommunity(AGENT_RECIPIENT)
})

test.serial('transaction without recipient existing', async t => {
  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID, 1, AGENT_RECIPIENT, TRANSACTION_TYPE)
  t.false(res.status)
  t.is(res.value, RECIPIENT_DOES_NOT_EXIST)
})

test.serial('transaction without sender existing', async t => {
  await setupDb(t)
  await addAgentToCommunity(AGENT_RECIPIENT, COMMUNITY_ID)

  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID, 1, AGENT_RECIPIENT, TRANSACTION_TYPE)
  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  t.is(ws, null)
  t.is(wr.balance, 0)
  t.false(res.status)
  t.is(res.value, NOT_ENOUGH_FUNDS)
})

test.serial('transaction without sender having enough funds', async t => {
  await addAgentToCommunity(AGENT_SENDER, COMMUNITY_ID)
  await setBalance(AGENT_SENDER, COMMUNITY_ID, 10)

  const amount = Decimal(DEFAULT_CREDIT_LIMIT).plus(10.001)
  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID, amount, AGENT_RECIPIENT, TRANSACTION_TYPE)
  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  t.is(ws.balance, 10)
  t.is(wr.balance, 0)
  t.false(res.status)
  t.is(res.value, NOT_ENOUGH_FUNDS)
})

test.serial('first proper transaction', async t => {
  const amount = 10.001
  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID, amount, AGENT_RECIPIENT, TRANSACTION_TYPE)
  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  t.is(ws.balance, -0.001)
  t.is(wr.balance, amount)
  t.true(res.status)
  t.falsy(res.value)
})
