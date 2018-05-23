import {Decimal} from 'decimal.js'
import {MINIMUM_CREDIT_LIMIT} from './AccountingGlobals'

export function calculateCreditLimitDelta (currentCreditLimit: Decimal,
  membersInCommunity: number, amountIncoming: Decimal): Decimal {
  let memberFactor = Decimal(membersInCommunity).minus(Decimal(currentCreditLimit).div(membersInCommunity).pow(2))
  if (memberFactor.lessThan(1)) memberFactor = Decimal(1)

  const delta = Decimal(amountIncoming).times(memberFactor)
  if (currentCreditLimit.minus(delta).lte(MINIMUM_CREDIT_LIMIT)) return currentCreditLimit.minus(MINIMUM_CREDIT_LIMIT)

  return delta
}
