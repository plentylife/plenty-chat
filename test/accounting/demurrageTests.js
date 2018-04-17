import test from 'ava'
import {getBalance, setBalance} from '../../src/db/AgentWalletTable'
import {nSQL} from 'nano-sql'
import {DEFAULT_CREDIT_LIMIT} from '../../src/accounting/AccountingGlobals'
import {setupDb} from '../utils'

const AGENT_ID = 'uid'
const COMMUNITY_ID = 'cid'

test.before(setupDb)

test('fake', t => {
  console.log('fake test')
  t.pass()
})
