import test from 'ava'
import {nSQL} from 'nano-sql'
import {getWallet, setBalance} from '../src/db/AgentWalletTable'
import {DEFAULT_CREDIT_LIMIT} from '../src/accounting/AccountingGlobals'
import {addAgentToCommunity} from '../src/actions/AgentActions'
import {DB_MODE} from '../src/state/GlobalState'

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
  t.deepEqual(wallet, {balance: 0, creditLimit: DEFAULT_CREDIT_LIMIT})
})

test.serial('adding agent should not affect existing account', async t => {
  await setBalance(AGENT_ID, COMMUNITY_ID, 10)
  let wallet = await getWallet(AGENT_ID, COMMUNITY_ID)
  t.deepEqual(wallet, {balance: 10, creditLimit: DEFAULT_CREDIT_LIMIT})

  const ares = await addAgentToCommunity(AGENT_ID, COMMUNITY_ID)
  t.true(ares)

  wallet = await getWallet(AGENT_ID, COMMUNITY_ID)
  t.deepEqual(wallet, {balance: 10, creditLimit: DEFAULT_CREDIT_LIMIT})
})
