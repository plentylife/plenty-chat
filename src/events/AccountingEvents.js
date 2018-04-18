// @flow

import type {Event} from './index'
import type {DemurrageByProperty} from '../accounting/Demurrage'
import {applyDeltaToWallet} from '../db/AgentWalletTable'

export const DEMURRAGE_EVEN_TYPE: 'demurrage' = 'demurrage'

export type DemurragePayload = DemurrageByProperty & {
  agendId: string
}

export async function handleDemurrageEvent (event: Event): Promise<boolean> {
  const p = (event.payload : DemurragePayload)
  return applyDeltaToWallet(
    event.communityId, p.agentId, p
  ).then(affR => (affR.length > 0))
}
