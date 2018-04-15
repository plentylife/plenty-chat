import test from 'ava'
import {nSQL} from 'nano-sql'
import {getBalance} from '../src/db/AgentWalletTable'
import {DEFAULT_CREDIT_LIMIT} from '../src/accounting/AccountingGlobals'
import {addAgentToCommunity} from '../src/actions/AgentActions'

console.log('NODE_ENV is ', process.env.NODE_ENV)

const AGENT_ID = 'uid'
const COMMUNITY_ID = 'comid'

nSQL().connect().then(async () => {
  test('adding agent to community', async t => {
    const ares = await addAgentToCommunity(AGENT_ID, COMMUNITY_ID)
    t.true(ares)

    const wallet = await getBalance(AGENT_ID, COMMUNITY_ID)
    t.deepEqual(wallet, {balance: 0, creditLimit: DEFAULT_CREDIT_LIMIT})
  })
})
