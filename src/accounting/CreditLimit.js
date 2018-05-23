import {Decimal} from 'decimal.js'

export function calculateCreditLimitDelta (currentCreditLimit: Decimal,
  membersInCommunity: number, amountIncoming: Decimal): Decimal {
  let memberFactor = Decimal(membersInCommunity).minus(Decimal(currentCreditLimit).div(membersInCommunity).pow(2))
  if (memberFactor.lessThan(1)) memberFactor = Decimal(1)

  const delta = Decimal(amountIncoming).times(memberFactor)
  return delta
}
