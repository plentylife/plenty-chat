// @flow
export function assertInt (i) {
  if (!Number.isInteger(i)) throw new Error('Number is not an integer')
}

export function assertAboveZero (i) {
  if (!(typeof i === 'number') || i <= 0) throw new Error('Number is not positive')
}
