import test from 'ava'
import {setupDb} from '../utils'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {makeTransaction} from '../../src/actions/AccountingActions'
import {getWallet, setBalance, setCreditLimit} from '../../src/db/AgentWalletTable'
import {AMOUNT_UNDER_ZERO, NOT_ENOUGH_FUNDS, RECIPIENT_DOES_NOT_EXIST} from '../../src/utils/UserErrors'
import {DEFAULT_CREDIT_LIMIT} from '../../src/accounting/AccountingGlobals'
import {Decimal} from 'decimal.js'
import {nSQL} from 'nano-sql'
import {AGENT_WALLET_TABLE} from '../../src/db/tableNames'

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
  // await setCreditLimit(AGENT_RECIPIENT, COMMUNITY_ID, )

  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID, 1, AGENT_RECIPIENT, TRANSACTION_TYPE)
  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  t.is(ws, null)
  t.is(wr.balance, 0)
  t.is(wr.creditLimit, DEFAULT_CREDIT_LIMIT)
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
  t.is(ws.creditLimit, DEFAULT_CREDIT_LIMIT)
  t.is(wr.creditLimit, DEFAULT_CREDIT_LIMIT)
  t.false(res.status)
  t.is(res.value, NOT_ENOUGH_FUNDS)
})

test.serial('negative amounts are not allowed', async t => {
  const amount = Decimal(-1)
  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID, amount, AGENT_RECIPIENT, TRANSACTION_TYPE)

  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  t.is(ws.balance, 10)
  t.is(wr.balance, 0)
  t.is(ws.creditLimit, DEFAULT_CREDIT_LIMIT)
  t.is(wr.creditLimit, DEFAULT_CREDIT_LIMIT)
  t.false(res.status)
  t.is(res.value, AMOUNT_UNDER_ZERO)
})

test.serial('first proper transaction', async t => {
  const amount = 10.001
  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID, amount, AGENT_RECIPIENT, TRANSACTION_TYPE)
  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  t.is(ws.balance, -0.001)
  t.is(wr.balance, amount)
  t.is(ws.creditLimit, DEFAULT_CREDIT_LIMIT)
  t.is(wr.creditLimit, Decimal(1.75).times(10.001).plus(DEFAULT_CREDIT_LIMIT).toNumber())
  t.true(res.status)
  t.falsy(res.value)
})

var previous = {
  COMMUNITY_ID: {
    AGENT_RECIPIENT: {creditLimit: -1, balance: null},
    AGENT_SENDER: {creditLimit: -1, balance: null}
  },
  COMMUNITY_ID_2: {
    AGENT_RECIPIENT: {creditLimit: -1, balance: null},
    AGENT_SENDER: {creditLimit: -1, balance: null}
  }
}

test.serial('transaction in opposite direction', async t => {
  const amount = 3.00009 // should get rounded
  const res = await makeTransaction(AGENT_RECIPIENT, COMMUNITY_ID, amount, AGENT_SENDER, TRANSACTION_TYPE)
  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  const wscl = Decimal(1.75).times(3).plus(DEFAULT_CREDIT_LIMIT).toNumber()
  const wrcl = Decimal(1.75).times(10.001).plus(DEFAULT_CREDIT_LIMIT).toNumber()

  t.is(ws.balance, 2.999)
  t.is(wr.balance, 7.001)
  t.is(ws.creditLimit, wscl)
  t.is(wr.creditLimit, wrcl)
  t.true(res.status)
  t.falsy(res.value)

  previous.COMMUNITY_ID.AGENT_RECIPIENT.creditLimit = wrcl
  previous.COMMUNITY_ID.AGENT_SENDER.creditLimit = wscl
})

test.serial('second transaction with an amount too precise', async t => {
  const amount = 4.00009 // should get rounded
  const res = await makeTransaction(AGENT_SENDER, COMMUNITY_ID, amount, AGENT_RECIPIENT, TRANSACTION_TYPE)
  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  const wscl = previous.COMMUNITY_ID.AGENT_SENDER.creditLimit
  const wrcl = previous.COMMUNITY_ID.AGENT_RECIPIENT.creditLimit + 4

  t.is(ws.balance, -1.001)
  t.is(wr.balance, 11.001)
  t.is(ws.creditLimit, wscl)
  t.is(wr.creditLimit, wrcl)
  t.true(res.status)
  t.falsy(res.value)

  previous.COMMUNITY_ID.AGENT_RECIPIENT.creditLimit = wrcl
  previous.COMMUNITY_ID.AGENT_RECIPIENT.balance = 11.001
  previous.COMMUNITY_ID.AGENT_SENDER.balance = -1.001
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
  t.is(wsC1.balance, previous.COMMUNITY_ID.AGENT_SENDER.balance)
  t.is(wrC1.balance, previous.COMMUNITY_ID.AGENT_RECIPIENT.balance)
  t.is(wsC1.creditLimit, previous.COMMUNITY_ID.AGENT_SENDER.creditLimit)
  t.is(wrC1.creditLimit, previous.COMMUNITY_ID.AGENT_RECIPIENT.creditLimit)
  t.is(wsC2, null)
  t.is(wrC2.balance, 0)
  t.is(wrC2.creditLimit, DEFAULT_CREDIT_LIMIT)
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

  t.is(wsC1.balance, previous.COMMUNITY_ID.AGENT_SENDER.balance)
  t.is(wrC1.balance, previous.COMMUNITY_ID.AGENT_RECIPIENT.balance)
  t.is(wsC1.creditLimit, previous.COMMUNITY_ID.AGENT_SENDER.creditLimit)
  t.is(wrC1.creditLimit, previous.COMMUNITY_ID.AGENT_RECIPIENT.creditLimit)
  t.is(wsC2.balance, 10)
  t.is(wrC2.balance, 0)
  t.is(wsC2.creditLimit, DEFAULT_CREDIT_LIMIT)
  t.is(wrC2.creditLimit, DEFAULT_CREDIT_LIMIT)
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
  const wrcl = Decimal(1.75).times(10.001).plus(DEFAULT_CREDIT_LIMIT).toNumber()

  t.is(wsC1.balance, previous.COMMUNITY_ID.AGENT_SENDER.balance)
  t.is(wrC1.balance, previous.COMMUNITY_ID.AGENT_RECIPIENT.balance)
  t.is(wsC1.creditLimit, previous.COMMUNITY_ID.AGENT_SENDER.creditLimit)
  t.is(wrC1.creditLimit, previous.COMMUNITY_ID.AGENT_RECIPIENT.creditLimit)
  t.is(wsC2.balance, -0.001)
  t.is(wrC2.balance, 10.001)
  t.is(wsC2.creditLimit, DEFAULT_CREDIT_LIMIT)
  t.is(wrC2.creditLimit, wrcl)
  t.true(res.status)
  t.falsy(res.value)
})

test.serial('checking credit limits with more members', async t => {
  await addAgentToCommunity('3', COMMUNITY_ID)
  await addAgentToCommunity('4', COMMUNITY_ID)
  await addAgentToCommunity('5', COMMUNITY_ID)

  await makeTransaction(AGENT_SENDER, COMMUNITY_ID, 2, '3', TRANSACTION_TYPE)

  const ws = await getWallet(AGENT_SENDER, COMMUNITY_ID)
  const wr = await getWallet(AGENT_RECIPIENT, COMMUNITY_ID)
  const wscl = previous.COMMUNITY_ID.AGENT_SENDER.creditLimit
  const wrcl = previous.COMMUNITY_ID.AGENT_RECIPIENT.creditLimit
  t.is(ws.creditLimit, wscl)
  t.is(wr.creditLimit, wrcl)

  const w3 = await getWallet('3', COMMUNITY_ID)
  const w4 = await getWallet('4', COMMUNITY_ID)
  const w5 = await getWallet('5', COMMUNITY_ID)
  t.is(w4.creditLimit, DEFAULT_CREDIT_LIMIT)
  t.is(w5.creditLimit, DEFAULT_CREDIT_LIMIT)

  t.is(w3.creditLimit, Decimal(4.96).times(2).plus(DEFAULT_CREDIT_LIMIT).toNumber())
})
