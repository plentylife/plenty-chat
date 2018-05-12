import test from 'ava'
import {nSQL} from 'nano-sql'
import {getWallet, setBalance} from '../src/db/AgentWalletTable'
import {DEFAULT_CREDIT_LIMIT} from '../src/accounting/AccountingGlobals'
import {addAgentToCommunity} from '../src/actions/AgentActions'
import {DB_MODE} from '../src/state/GlobalState'
import {AGENT_WALLET_TABLE} from '../src/db/tableNames'

const AGENT_ID = 'uid'
const COMMUNITY_ID = 'comid'

test.before(t => {
  t.is(DB_MODE, 'TEMP')
  return nSQL().connect()
})

test.serial('adding agent to community', async t => {
  const ares = await addAgentToCommunity(AGENT_ID, COMMUNITY_ID)
  t.true(ares)

  const wallet = await getWallet(AGENT_ID, COMMUNITY_ID)
  t.is(wallet.balance, 0)
  t.is(wallet.creditLimit, DEFAULT_CREDIT_LIMIT)
})

test.serial('adding agent should not affect existing account', async t => {
  await setBalance(AGENT_ID, COMMUNITY_ID, 10)
  let wallet = await getWallet(AGENT_ID, COMMUNITY_ID)
  t.is(wallet.balance, 10)
  t.is(wallet.creditLimit, DEFAULT_CREDIT_LIMIT)

  const ares = await addAgentToCommunity(AGENT_ID, COMMUNITY_ID, /* force */ true)
  t.true(ares)

  // there should be only one agent
  await nSQL(AGENT_WALLET_TABLE).query('select').exec().then(r => {
    t.is(r.length, 1)
  })

  wallet = await getWallet(AGENT_ID, COMMUNITY_ID)
  t.is(wallet.balance, 10)
  t.is(wallet.creditLimit, DEFAULT_CREDIT_LIMIT)
})

test.serial('adding agent for the second time should not happen', async t => {
  const second = await addAgentToCommunity(AGENT_ID, COMMUNITY_ID)
  t.is(second, null)
})
