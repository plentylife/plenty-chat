// @flow

import {getAllCommunitySharePoints} from '../db/AgentWalletTable'

export type PotSplitEntry = {
  agentId: string, amount: number
}

export async function calculateCommunityPotSplit (communityId: string, communityBalance: number):
  Promise<Array<PotSplitEntry>> {
  const points = await getAllCommunitySharePoints(communityId)

  const sum = points.reduce((acc, next) => (acc + next.communitySharePoints), 0)

  // fixme make sure that a single person does not bleed out the whole community pot

  return points.map(p => {
    const pn = Object.assign({}, p)
    if (sum !== 0) {
      pn.amount = Math.floor((p.communitySharePoints / sum) * communityBalance)
    } else {
      pn.amount = 0
    }
    return pn
  })
}
