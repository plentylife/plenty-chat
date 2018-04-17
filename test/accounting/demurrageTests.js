import test from 'ava'
import {getBalance, setBalance} from '../../src/db/AgentWalletTable'
import {nSQL} from 'nano-sql'
import {DEFAULT_DEMURRAGE_RATE} from '../../src/accounting/AccountingGlobals'
import {setupDb} from '../utils'
import {_calculateDemurrage} from '../../src/accounting/Demurrage'
import {getBaseLog} from '../../src/accounting/utils'

const AGENT_ID = 'uid'
const COMMUNITY_ID = 'cid'

const invertedRate = 1 - DEFAULT_DEMURRAGE_RATE

test.before(setupDb)

function cdMacro (t, b, p, ex) {
  t.is(ex, _calculateDemurrage(b, DEFAULT_DEMURRAGE_RATE, p))
}
cdMacro.title = (title, balance, period, expected) => `${title} - balance of ${balance} at period ${period} == ${expected}`

test('calculating demurrage for small amounts', cdMacro, 1, 1, 0)
test('calculating demurrage for small amounts', cdMacro, 1, 2, 0)
test('calculating demurrage for small amounts', cdMacro, 1, getBaseLog(invertedRate, 0.5) + 1, 1)

test('calculating demurrage', cdMacro, 10, getBaseLog(invertedRate, 0.6) + 1, 4)
test('calculating demurrage', cdMacro, 10, getBaseLog(invertedRate, 0.555), 4)
test('calculating demurrage', cdMacro, 10, getBaseLog(invertedRate, 0.5), 5)
test('calculating demurrage', cdMacro, 10, getBaseLog(invertedRate, 0.5) + 1, 5)

// these assume 2% rate
test('calculating demurrage for small periods', cdMacro, 100, 1, 2)
test('calculating demurrage for small periods', cdMacro, 100, 0.5, 1)
test('calculating demurrage for small periods', cdMacro, 100, 0.2, 0)

/* Validation tests */

test('negative balances are illegal', t => {
  t.throws(() => _calculateDemurrage(-1, 0.1, 1), RangeError, /balance/)
})

test('negative periods are illegal', t => {
  t.throws(() => _calculateDemurrage(1, 0.1, -1), {instanceOf: RangeError, message: 'Period cannot be negative'})
})

test('rate should be within [0,1]', async t => {
  await t.throws(() => _calculateDemurrage(1, -0.1, 1), {instanceOf: RangeError, message: 'Rate has to be 0 or more'})
  await t.throws(() => _calculateDemurrage(1, 1.1, 1), RangeError, 'Rate has to be 1 or less')
})
