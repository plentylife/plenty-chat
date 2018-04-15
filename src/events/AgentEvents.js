// @flow

import type {Event} from './index'
import {STUB} from '../utils'
import {walletExists} from '../db/AgentWalletTable'
import {initializeAccount} from '../accounting/Accounting'

// export const CREATE_AGENT_EVENT_TYPE: 'createAgent' = 'createAgent'

export const ADD_AGENT_TO_COMMUNITY_EVEN_TYPE: 'addAgentToCommunity' = 'addAgentToCommunity'

export async function handleCreateAgentEvent (event: Event): Promise<boolean> {
  // const agentId = event.senderId
  STUB()
}

export async function handleAddAgentToCommunity (event: Event): Promise<boolean> {
  return walletExists(event.senderId, event.communityId).then(e => {
    if (!e) {
      return initializeAccount(event.senderId, event.communityId)
    } else {
      return true
    }
  })
}
