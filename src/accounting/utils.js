// @flow
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
