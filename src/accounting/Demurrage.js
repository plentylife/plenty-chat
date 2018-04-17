// @flow
import {STUB} from '../utils'
import {assertPositive} from './utils'

/** @return whole numbers only */
export function _calculateDemurrage (balance: number, ratePerPeriod: number, periods: number): number {
  if (ratePerPeriod > 1) throw new RangeError('Rate has to be 1 or less')
  if (ratePerPeriod < 0) throw new RangeError('Rate has to be 0 or more')
  if (balance < 0) throw new RangeError('Balance cannot be negative')
  assertPositive(periods, /* zero allowed */ true, 'Period cannot be negative')

  const rate = 1 - ratePerPeriod
  const lossFactor = 1 - (Math.pow(rate, periods))
  return Math.round(balance * lossFactor)
}

export function _calculatePeriods (timeSpan: number, periodLength: number): number {
  STUB()
}

// export function _cdaBalance

export type DemurrageByProperty = {
  balance: number,
  communitySharePoints: number
}

export function _calculateDemurrageForAgent (agentId: string): DemurrageByProperty {
  STUB()
}

export function applyDemurrage (agentId: string): void {
  STUB()
}
