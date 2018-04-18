// @flow
import {assertPositive} from './utils'
import type {Wallet} from '../db/AgentWalletTable'
import {DEFAULT_DEMURRAGE_PERIOD, DEFAULT_DEMURRAGE_RATE} from './AccountingGlobals'

/** @return whole numbers only */
export function _calculateDemurrage (balance: number, ratePerPeriod: number, periods: number): number {
  if (ratePerPeriod > 1) throw new RangeError('Rate has to be 1 or less')
  if (ratePerPeriod < 0) throw new RangeError('Rate has to be 0 or more')
  if (balance < 0) throw new RangeError('Balance cannot be negative')
  assertPositive(periods, /* zero allowed */ true, `Period count cannot be negative -- ${periods}`)

  const rate = 1 - ratePerPeriod
  const lossFactor = 1 - (Math.pow(rate, periods))
  return Math.round(balance * lossFactor)
}

function _calculatePeriods (timeSpan: number, periodLength: number): number {
  return (timeSpan / periodLength)
}

export type DemurrageByProperty = {
  balance: number,
  communitySharePoints: number
}

function _cda (w: Wallet, p: string) {
  const periods = _calculatePeriods(w.demurrageTimestamps[p], DEFAULT_DEMURRAGE_PERIOD)
  return _calculateDemurrage(w[p], DEFAULT_DEMURRAGE_RATE, periods)
}

export function calculateDemurrageForAgent (agentWallet: Wallet): DemurrageByProperty {
  return {
    balance: _cda(agentWallet, 'balance'),
    communitySharePoints: _cda(agentWallet, 'communitySharePoints')
  }
}
