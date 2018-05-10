import test from 'ava'
import {setupDb} from '../utils'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {makeTransaction} from '../../src/actions/AccountingActions'
import {AGENT_WALLET_TABLE, getWallet, setBalance} from '../../src/db/AgentWalletTable'
import {NOT_ENOUGH_FUNDS, RECIPIENT_DOES_NOT_EXIST} from '../../src/utils/UserErrors'
import {DEFAULT_CREDIT_LIMIT} from '../../src/accounting/AccountingGlobals'
import {Decimal} from 'decimal.js'
import {nSQL} from 'nano-sql'

const TRANSACTION_TYPE = 'peer'

const AGENT_SENDER = 'afrom'
const AGENT_RECIPIENT = 'ato'
const COMMUNITY_ID = 'comid'
const COMMUNITY_ID_2 = 'comid-2'

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

test.serial('second transaction with an amount too precise', async t => {
  const amount = 1.00009 // should get rounded
  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID, amount, AGENT_RECIPIENT, TRANSACTION_TYPE)
  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  t.is(ws.balance, -1.001)
  t.is(wr.balance, 11.001)
  t.true(res.status)
  t.falsy(res.value)
})

test.serial('transaction in opposite direction', async t => {
  const amount = 3.00009 // should get rounded
  const res = await makeTransaction(AGENT_RECIPIENT, COMMUNITY_ID, amount, AGENT_SENDER, TRANSACTION_TYPE)
  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  t.is(ws.balance, 1.999)
  t.is(wr.balance, 8.001)
  t.true(res.status)
  t.falsy(res.value)
})

// with a second community. same thing. improper setups. then proper setup.

test.serial('transaction without recipient existing in second community', async t => {
  await addAgentToCommunity(AGENT_SENDER, COMMUNITY_ID_2)

  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID_2, 1, AGENT_RECIPIENT, TRANSACTION_TYPE)
  t.false(res.status)
  t.is(res.value, RECIPIENT_DOES_NOT_EXIST)
})

test.serial('transaction without sender existing in second community', async t => {
  await nSQL(AGENT_WALLET_TABLE).query('delete').where([['agentId', '=', AGENT_SENDER], 'AND', ['communityId', '=', COMMUNITY_ID_2]]).exec()
  await addAgentToCommunity(AGENT_RECIPIENT, COMMUNITY_ID_2)

  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID_2, 1, AGENT_RECIPIENT, TRANSACTION_TYPE)
  const wsC1 = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wrC1 = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  const wsC2 = await getWallet(AGENT_SENDER, COMMUNITY_ID_2)
  const wrC2 = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID_2)
  t.is(wsC1.balance, 1.999)
  t.is(wrC1.balance, 8.001)
  t.is(wsC2, null)
  t.is(wrC2.balance, 0)
  t.false(res.status)
  t.is(res.value, NOT_ENOUGH_FUNDS)
})

test.serial('transaction without sender having enough funds in second community', async t => {
  await addAgentToCommunity(AGENT_SENDER, COMMUNITY_ID_2)
  await setBalance(AGENT_SENDER, COMMUNITY_ID_2, 10)
  let wsC2 = await getWallet(AGENT_SENDER, COMMUNITY_ID_2)
  t.is(wsC2.balance, 10)

  const amount = Decimal(DEFAULT_CREDIT_LIMIT).plus(10.001)
  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID_2, amount, AGENT_RECIPIENT, TRANSACTION_TYPE)
  const wsC1 = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wrC1 = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  wsC2 = await getWallet(AGENT_SENDER, COMMUNITY_ID_2)
  const wrC2 = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID_2)

  t.is(wsC1.balance, 1.999)
  t.is(wrC1.balance, 8.001)
  t.is(wsC2.balance, 10)
  t.is(wrC2.balance, 0)
  t.false(res.status)
  t.is(res.value, NOT_ENOUGH_FUNDS)
})

test.serial('first proper transaction in second community', async t => {
  const amount = 10.001
  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID_2, amount, AGENT_RECIPIENT, TRANSACTION_TYPE)
  const wsC1 = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wrC1 = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  const wsC2 = await getWallet(AGENT_SENDER, COMMUNITY_ID_2)
  const wrC2 = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID_2)

  t.is(wsC1.balance, 1.999)
  t.is(wrC1.balance, 8.001)
  t.is(wsC2.balance, -0.001)
  t.is(wrC2.balance, 10.001)
  t.true(res.status)
  t.falsy(res.value)
})
