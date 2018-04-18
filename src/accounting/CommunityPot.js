// @flow

import {getAllCommunitySharePoints} from '../db/AgentWalletTable'

export type PotSplitEntry = {
  agentId: string, amount: number
}

export async function calculateCommunityPotSplit (communityId: string, communityBalance: number):
  Promise<Array<PotSplitEntry>> {
  const points = await getAllCommunitySharePoints(communityId)
  // const communityBalance = await getCommunityBalance(communityId)

  const sum = points.reduce((acc, next) => (acc + next.communitySharePoints), 0)
  return points.map(p => {
    const pn = Object.assign({}, p)
    pn.amount = Math.floor((p.communitySharePoints / sum) * communityBalance)
    return pn
  })
}
