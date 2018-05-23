import test from 'ava'
import {
  LENGTH_OF_DAY,
  MAXIMUM_DEMURRAGE_RATE,
  STATISTICS_DEMURRAGE_RATE
} from '../../src/accounting/AccountingGlobals'
import {
  _calculateDemurrage,
  calculateDemurrageForAgent,
  generateDemurrageTimestamps
} from '../../src/accounting/Demurrage'
import {getBaseLog} from '../../src/accounting/utils'
import apEq from 'approximately-equal'

const DEMURRAGE_RATE = 0.98

function cdMacro (t, b, p, ex) {
  const d = _calculateDemurrage(b, DEMURRAGE_RATE, p)
  t.is(ex, d.toNumber())
}
cdMacro.title = (title, balance, period, expected) => `${title} - balance of ${balance} at period ${period} == ${expected}`

test('calculating demurrage for small amounts', cdMacro, 1, 1, 0.02)
test('calculating demurrage for small amounts', cdMacro, 1, 2, 0.0396)
// test('calculating demurrage for small amounts', cdMacro, 1, getBaseLog(DEMURRAGE_RATE, 0.5) + 1, 1)

// test('calculating demurrage', cdMacro, 10, getBaseLog(DEMURRAGE_RATE, 0.6) + 1, 4)
// test('calculating demurrage', cdMacro, 10, getBaseLog(DEMURRAGE_RATE, 0.555), 4)
// test('calculating demurrage', cdMacro, 10, getBaseLog(DEMURRAGE_RATE, 0.5), 5)
// test('calculating demurrage', cdMacro, 10, getBaseLog(DEMURRAGE_RATE, 0.5) + 1, 5)

// these assume 2% rate
test('calculating demurrage for small periods', cdMacro, 100, 1, 2)
test('calculating demurrage for small periods', cdMacro, 100, 0.5, 1.00505)
test('calculating demurrage for small periods', cdMacro, 100, 0.2, 0.40323)

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
  let wallet = {...w}
  let timestamp = (new Date().getTime()) - la * LENGTH_OF_DAY
  wallet.demurrageTimestamps = generateDemurrageTimestamps(timestamp)
  const res = calculateDemurrageForAgent(wallet, la * LENGTH_OF_DAY)
  t.true(apEq(ex.balance, res.balance.toNumber(), 0.0001))
  t.true(apEq(ex.communitySharePoints, res.communitySharePoints.toNumber(), 0.0001))
  if (ex.creditLimit) t.true(apEq(ex.creditLimit, res.creditLimit.toNumber(), 0.0001))
  if (ex.outgoingStat) t.true(apEq(ex.outgoingStat, res.outgoingStat.toNumber(), 0.0001))
  if (ex.incomingStat) t.true(apEq(ex.incomingStat, res.incomingStat.toNumber(), 0.0001))
}
cdaMacro.title = (t, w, la, ex) => `${t} - ${JSON.stringify(w)} at ${la} => ${JSON.stringify(ex)}`

test('calculating demurrage for agent', cdaMacro, {
  balance: 100, communitySharePoints: 110, incomingStat: 0, outgoingStat: 0, creditLimit: 1
}, 1, {
  balance: 0, communitySharePoints: 0, incomingStat: 0, outgoingStat: 0, creditLimit: 0
})

test('calculating demurrage for agent', cdaMacro, {
  balance: 1, communitySharePoints: 100, incomingStat: 10, outgoingStat: 20, creditLimit: 1
}, 1, {
  balance: 0, communitySharePoints: 0, incomingStat: 10 * (1 - STATISTICS_DEMURRAGE_RATE), outgoingStat: 20 * (1 - STATISTICS_DEMURRAGE_RATE), creditLimit: 0
})

test('calculating demurrage for agent', cdaMacro, {
  balance: 1, communitySharePoints: 100, incomingStat: 10, outgoingStat: 0, creditLimit: 2
}, 1, {
  balance: 1 - MAXIMUM_DEMURRAGE_RATE, communitySharePoints: 100 * (1 - MAXIMUM_DEMURRAGE_RATE), creditLimit: (1 - STATISTICS_DEMURRAGE_RATE) * 2
})

const stdr35 = 1 - Math.pow(STATISTICS_DEMURRAGE_RATE, 35)
test('calculating demurrage for agent', cdaMacro, {
  balance: 1, communitySharePoints: 110, incomingStat: 10, outgoingStat: 7, creditLimit: 11.6
}, 35, {
  balance: 0.1395, communitySharePoints: 110 * 0.13956942799, incomingStat: 10 * stdr35, outgoingStat: 7 * stdr35, creditLimit: 11.6 * stdr35
})

test('calculating demurrage for agent', cdaMacro, {
  balance: 100, communitySharePoints: 1, incomingStat: 10, outgoingStat: 5, creditLimit: 1
}, 0.5, {
  balance: 0.501256289, communitySharePoints: 0.00501256289
})
