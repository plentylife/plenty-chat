import test from 'ava'
import {convertStringToValidAmount} from '../../src/accounting/Accounting'
import {Decimal} from 'decimal.js'

function strToAmount (t, input, exAm, exEr) {
  const res = convertStringToValidAmount(input)
  const isDecimal = res.amount instanceof Decimal
  t.is(isDecimal ? res.amount.toNumber() : res.amount, exAm)
  t.true((exEr && !!res.error) || (!exEr && !res.error))
}
strToAmount.title = (t, i, exAm, exEr) => `${t} [${i}] => [${exEr ? 'error' : exAm}]`

test('integer', strToAmount, '1', 1, false)
test('integer', strToAmount, '5', 5, false)
test('float', strToAmount, '4.1', 4.1, false)
test('float', strToAmount, '6.758', 6.758, false)
test('float too precise', strToAmount, '6.7586', 6.758, false)
test('float too precise', strToAmount, '6.758698', 6.758, false)
test('number is negative', strToAmount, '-6.758698', -6.758698, true)
test('number is zero', strToAmount, '0', 0, true)
test('not a number', strToAmount, 'hello', null, true)
test('not a number', strToAmount, '56hello', null, true)
