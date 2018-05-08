// @flow
import {WrongValue} from '../utils/Error'

export function assertInt (i: number) {
  if (!Number.isInteger(i)) throw new TypeError('Number is not an integer')
}

export function assertPositive (i: number, zeroAllowed: boolean = false, message = '') {
  const isPositive = zeroAllowed ? i >= 0 : i > 0
  const msg = message || `Number is not positive [${i}]`
  if (!(typeof i === 'number') || !isPositive) throw new RangeError(msg)
}

export function assertNumber (i: number) {
  if (!(typeof i === 'number')) throw new TypeError(`Is not a number ${i}`)
}

export function assertBetweenZeroOne (i: number) {
  assertNumber(i)
  if (i < 0) throw new WrongValue('Cannot be less than zero')
  if (i > 1) throw new WrongValue('Cannot be more than 1')
}

export function getBaseLog (base, x) {
  return Math.log(x) / Math.log(base)
}

export function floorWithPrecision (n, decimalPlaces = 5) {
  const rf = Math.pow(10, decimalPlaces)
  return Math.floor(n * rf) / rf
}