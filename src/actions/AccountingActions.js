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
    const paylaod = Object.assign({}, d, w)
    sendEvent(DEMURRAGE_EVEN_TYPE, getCurrentAgentId(), w.communityId, paylaod)
  })
  return Promise.all(sentPromises)
}
