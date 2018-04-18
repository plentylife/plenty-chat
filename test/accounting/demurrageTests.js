import test from 'ava'
import {DEFAULT_DEMURRAGE_RATE, LENGTH_OF_DAY} from '../../src/accounting/AccountingGlobals'
import {_calculateDemurrage, calculateDemurrageForAgent} from '../../src/accounting/Demurrage'
import {getBaseLog} from '../../src/accounting/utils'
import apEq from 'approximately-equal'

const invertedRate = 1 - DEFAULT_DEMURRAGE_RATE

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
  t.throws(() => _calculateDemurrage(1, 0.1, -1), {instanceOf: RangeError, message: /Period.*cannot.*negative/})
})

test('rate should be within [0,1]', async t => {
  await t.throws(() => _calculateDemurrage(1, -0.1, 1), {instanceOf: RangeError, message: 'Rate has to be 0 or more'})
  await t.throws(() => _calculateDemurrage(1, 1.1, 1), RangeError, 'Rate has to be 1 or less')
})

/* Calculations on wallets */

function cdaMacro (t, w, la, ex) {
  const res = calculateDemurrageForAgent(w, la * LENGTH_OF_DAY)
  t.true(apEq(ex.balance, res.balance))
  t.true(apEq(ex.communitySharePoints, res.communitySharePoints))
}
cdaMacro.title = (t, w, la, ex) => `${t} - ${JSON.stringify(w)} at ${la} => ${JSON.stringify(ex)}`

test('calculating demurrage for agent', cdaMacro, {
  balance: 100, communitySharePoints: 110
}, 1, {
  balance: 2, communitySharePoints: 2
})

test('calculating demurrage for agent', cdaMacro, {
  balance: 1, communitySharePoints: 100
}, 1, {
  balance: 0, communitySharePoints: 2
})

test('calculating demurrage for agent', cdaMacro, {
  balance: 1, communitySharePoints: 110
}, 35, {
  balance: 1, communitySharePoints: 56
})

test('calculating demurrage for agent', cdaMacro, {
  balance: 100, communitySharePoints: 1
}, 0.5, {
  balance: 1, communitySharePoints: 0
})
