// @flow

import type {Event} from './index'
import type {DemurrageByProperty} from '../accounting/Demurrage'
import {applyDemurrageToWallet, getWallet, setBalance} from '../db/AgentWalletTable'
import type {PotSplitEntry} from '../accounting/CommunityPot'
import {getCommunityBalance, setCommunityBalance} from '../db/CommunityTable'
import {floorWithPrecision} from '../accounting/utils'

export const DEMURRAGE_EVEN_TYPE: 'demurrage' = 'demurrage'

export const COMMUNITY_POT_SPLIT: 'potSplit' = 'potSplit'

export type DemurragePayload = DemurrageByProperty & {
  agendId: string
}

export async function handleDemurrageEvent (event: Event): Promise<boolean> {
  const p = (event.payload : DemurragePayload)
  return applyDemurrageToWallet(
    p.agentId, event.communityId, p
  ).then(affR => (affR.length > 0))
}

export async function handleCommunityPotSplit (event: Event): Promise<boolean> {
  const p: Array<PotSplitEntry> = (event.payload: Array<PotSplitEntry>)
  if (!(p instanceof Array)) throw new TypeError('Pot split event payload must be an array')
  const payload = [...p]
  console.log(`Splitting Community (${event.communityId}) ${payload.length} ways`, payload)
  let entry = payload.shift()
  while (entry && entry.amount !== 0) {
    const communityBalance = await getCommunityBalance(event.communityId) // fixme move up
    const wallet = await getWallet(entry.agentId, event.communityId)
    const newCommBalance = floorWithPrecision(communityBalance - entry.amount)
    const newAgentBalance = floorWithPrecision(wallet.balance + entry.amount)
    await setBalance(entry.agentId, event.communityId, newAgentBalance)
    await setCommunityBalance(event.communityId, newCommBalance)
    console.log(`Handling community split for agent ${entry.agentId} ${communityBalance} - ${entry.amount} = ${newCommBalance}`)
    entry = payload.shift()
  }
  return true
}
