// @flow

import {getAllWallets} from '../db/AgentWalletTable'
import {calculateDemurrageForAgent} from '../accounting/Demurrage'
import {sendEvent} from '../events'
import {COMMUNITY_POT_SPLIT, DEMURRAGE_EVEN_TYPE} from '../events/AccountingEvents'
import {getCurrentAgentId} from '../state/GlobalState'
import {getAllCommunities} from '../db/CommunityTable'
import {calculateCommunityPotSplit} from '../accounting/CommunityPot'

export async function applyDemurrageToAll (): Promise<boolean> {
  const wallets = await getAllWallets()
  const sentPromises = wallets.map(w => {
    const d = calculateDemurrageForAgent(w)
    let hasAnyNonZero = 0
    Object.keys(d).forEach(k => {
      hasAnyNonZero += d[k]
    })
    if (hasAnyNonZero > 0) {
      const payload = Object.assign({}, w, d) // fixme remove unnecessary properties from payload
      console.log(`Sending out demurrage for agent ${w.agentId} with payload ${payload}`)
      return sendEvent(DEMURRAGE_EVEN_TYPE, getCurrentAgentId(), w.communityId, payload)
    } else {
      return Promise.resolve(true)
    }
  })
  return Promise.all(sentPromises)
}

export async function splitAllCommunityPots (): Promise<boolean> {
  const communities = await getAllCommunities()
  const promises = communities.map(c => {
    return calculateCommunityPotSplit(c.communityId, c.balance).then(splits => {
      return sendEvent(COMMUNITY_POT_SPLIT, getCurrentAgentId(), c.communityId, splits)
    })
  })
  return Promise.all(promises)
}
