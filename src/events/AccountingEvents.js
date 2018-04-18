// @flow

import type {Event} from './index'
import {walletExists} from '../db/AgentWalletTable'
import {initializeAccount} from '../accounting/Accounting'

export const DEMURRAGE_EVEN_TYPE: 'demurrage' = 'demurrage'

export type DemurragePayload = {
  agendId: string,
  amount: number
}

export async function handleDemurrageEvent (event: Event): Promise<boolean> {
  return walletExists(event.senderId, event.communityId).then(e => {
    if (!e) {
      return initializeAccount(event.senderId, event.communityId)
    } else {
      return true
    }
  })
}
