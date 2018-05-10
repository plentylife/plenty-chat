// @flow
import {WrongValue} from '../utils/Error'
import './required'
import {Decimal} from 'decimal.js'

export function assertInt (i: number) {
  if (!Number.isInteger(i)) throw new TypeError('Number is not an integer')
}

export function assertPositive (_i: number, zeroAllowed: boolean = false, message = '') {
  assertNumber(_i)
  const i = Decimal(_i)
  const isPositive = zeroAllowed ? i.gte(0) : i.gt(0)
  const msg = message || `Number is not positive [${i}]`
  if (!isPositive) throw new RangeError(msg)
}

export function assertNumber (i: number) {
  if (!(typeof i === 'number' || i instanceof Decimal)) {
    throw new TypeError(`Is not a number ${i}`)
  }
}

export function assertBetweenZeroOne (i: number) {
  assertNumber(i)
  if (i < 0) throw new WrongValue('Cannot be less than zero')
  if (i > 1) throw new WrongValue('Cannot be more than 1')
}

export function getBaseLog (base, x) {
  return Math.log(x) / Math.log(base)
}

/** @deprecated('use the Decimal version instead') */
export function floorWithPrecisionPrimitive (n, decimalPlaces = 5) {
  const rf = Math.pow(10, decimalPlaces)
  return Math.floor(n * rf) / rf
}

export function floorWithPrecision (n, decimalPlaces = 5) {
  const rf = Decimal(10).pow(decimalPlaces)
  return Decimal(n).times(rf).floor().div(rf)
}
