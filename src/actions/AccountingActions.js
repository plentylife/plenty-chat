// @flow

import {getAllWallets} from '../db/AgentWalletTable'
import {calculateDemurrageForAgent} from '../accounting/Demurrage'
import {sendEvent} from '../events'
import {DEMURRAGE_EVEN_TYPE} from '../events/AccountingEvents'
import {getCurrentAgentId} from '../state/GlobalState'

export async function applyDemurrageToAll (): Promise<boolean> {
  const wallets = await getAllWallets()
  const sentPromises = wallets.map(w => {
    const d = calculateDemurrageForAgent(w)
    let hasAnyNonZero = 0
    Object.keys(d).forEach(k => {
      hasAnyNonZero += d[k]
    })
    if (hasAnyNonZero > 0) {
      const paylaod = Object.assign({}, w, d) // fixme remove unnecessary properties from payload
      return sendEvent(DEMURRAGE_EVEN_TYPE, getCurrentAgentId(), w.communityId, paylaod)
    } else {
      return Promise.resolve(true)
    }
  })
  return Promise.all(sentPromises)
}
