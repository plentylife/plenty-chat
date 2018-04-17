// @flow
import {WrongValue} from '../utils/Error'

export function assertInt (i: number) {
  if (!Number.isInteger(i)) throw new TypeError('Number is not an integer')
}

export function assertPositive (i: number, zeroAllowed: boolean = false) {
  const isPositive = zeroAllowed ? i >= 0 : i > 0
  if (!(typeof i === 'number') || !isPositive) throw new Error('Number is not positive')
}

export function assertNumber (i: number) {
  if (!(typeof i === 'number')) throw new TypeError(`Is not a number ${i}`)
}

export function assertBetweenZeroOne (i: number) {
  assertNumber(i)
  if (i < 0) throw new WrongValue('Cannot be less than zero')
  if (i > 1) throw new WrongValue('Cannot be more than 1')
}
