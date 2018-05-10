// @flow

import {getAllCommunitySharePoints} from '../db/AgentWalletTable'
import {floorWithPrecision} from './utils'
import './required'
import {Decimal} from 'decimal.js'

export type PotSplitEntry = {
  agentId: string, amount: number
}

export async function calculateCommunityPotSplit (communityId: string, communityBalance: number):
  Promise<Array<PotSplitEntry>> {
  const points = await getAllCommunitySharePoints(communityId)

  const pointsSum = points.reduce((acc, next) => (acc + next.communitySharePoints), 0)

  let amountsSum = Decimal(0)
  let largestShare = {agentId: null, share: -1}
  const amounts = points.map(p => {
    const pn = Object.assign({}, p)
    if (pointsSum !== 0) {
      pn.amount = floorWithPrecision(Decimal(p.communitySharePoints).div(pointsSum).times(communityBalance))
    } else {
      pn.amount = 0
    }
    if (pn.amount.gt(largestShare.share)) largestShare = {agentId: p.agentId, share: pn.amount}
    amountsSum = amountsSum.plus(pn.amount)
    pn.amount = pn.amount.toNumber()
    return pn
  })

  // have to make sure that community balance is fully split, and there are no leftovers that will slowly throw everything off balance
  const leftOver = Decimal(communityBalance).minus(amountsSum)
  if (leftOver.lessThan(0)) throw new RangeError('Something is very wrong with community pot split calculations. The sum of all agent balances is higher than community balance')
  const largest = amounts.find(p => (p.agentId === largestShare.agentId))
  largest.amount = Decimal(largest.amount).plus(leftOver).toNumber()
  return amounts
}
