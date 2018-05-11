// @flow
import {assertPositive} from './utils'
import type {Wallet} from '../db/AgentWalletTable'
import {DEFAULT_DEMURRAGE_PERIOD, DEFAULT_DEMURRAGE_RATE, MAXIMUM_DEMURRAGE_RATE} from './AccountingGlobals'
import './required'
import {Decimal} from 'decimal.js'

/** @return whole numbers only */
export function _calculateDemurrage (balance: number, _ratePerPeriod: number, periods: number): number {
  const ratePerPeriod = Decimal(_ratePerPeriod)
  if (ratePerPeriod.gt(1)) throw new RangeError('Rate has to be 1 or less')
  if (ratePerPeriod.lt(0)) throw new RangeError('Rate has to be 0 or more')
  if (balance < 0) throw new RangeError('Balance cannot be negative')
  assertPositive(periods, /* zero allowed */ true, `Period count cannot be negative -- ${periods}`)

  const rate = Decimal(1).minus(ratePerPeriod)
  const lossFactor = Decimal(1).minus(Decimal(rate).pow(periods))
  return Math.round(lossFactor.times(balance))
}

function _calculatePeriods (timeSpan: number, periodLength: number): number {
  return (timeSpan / periodLength)
}

export type DemurrageByProperty = {
  balance: number,
  communitySharePoints: number
}

function _calculateDemurrageRate (incomingStat: Decimal, outgoingStat: Decimal): Decimal {
  const max = Decimal(MAXIMUM_DEMURRAGE_RATE)
  if (outgoingStat.lte(0)) return max
  const rate = Decimal(incomingStat).div(outgoingStat)
  return rate.gt(max) ? max : rate
}

function _cda (w: Wallet, p: string) {
  const now = new Date().getTime()
  const periods = _calculatePeriods(now - w.demurrageTimestamps[p], DEFAULT_DEMURRAGE_PERIOD)
  const balance = w[p]
  if (balance <= 0) return 0
  const rate = _calculateDemurrageRate(w.incomingStat, w.outgoingStat)
  return _calculateDemurrage(balance, rate, periods)
}

export function calculateDemurrageForAgent (agentWallet: Wallet): DemurrageByProperty {
  return {
    balance: _cda(agentWallet, 'balance'),
    communitySharePoints: _cda(agentWallet, 'communitySharePoints')
  }
}
