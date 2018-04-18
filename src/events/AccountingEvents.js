// @flow

import type {Event} from './index'
import type {DemurrageByProperty} from '../accounting/Demurrage'
import {applyDemurrageToWallet} from '../db/AgentWalletTable'

export const DEMURRAGE_EVEN_TYPE: 'demurrage' = 'demurrage'

export type DemurragePayload = DemurrageByProperty & {
  agendId: string
}

export async function handleDemurrageEvent (event: Event): Promise<boolean> {
  const p = (event.payload : DemurragePayload)
  return applyDemurrageToWallet(
    p.agentId, event.communityId, p
  ).then(affR => (affR.length > 0))
}
