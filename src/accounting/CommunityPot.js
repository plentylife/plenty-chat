// @flow

import {getAllCommunitySharePoints} from '../db/AgentWalletTable'
import {getCommunityBalance} from '../db/CommunityTable'

export type PotSplitEntry = {
  agentId: string, amount: number
}

export async function calculateCommunityPotSplit (communityId: string): Promise<Array<PotSplitEntry>> {
  const points = await getAllCommunitySharePoints(communityId)
  const communityBalance = await getCommunityBalance(communityId)

  const sum = points.reduce((acc, next) => (acc + next.communitySharePoints))
  return points.map(p => {
    p.amount = Math.floor((p.communitySharePoints / sum) * communityBalance)
    return p
  })
}
