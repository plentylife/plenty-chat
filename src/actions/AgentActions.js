// @flow

import {sendEvent} from '../events'
import {STUB} from '../utils'
import {ADD_AGENT_TO_COMMUNITY_EVEN_TYPE} from '../events/AgentEvents'

export async function createAgent (agentId: string): Promise<boolean> {
  // return sendEvent(MESSAGE_EVENT_TYPE, agentId, null, {})
  STUB()
}

// todo. maybe this should be in a community actions file?

export async function addAgentToCommunity (agentId: string, communityId: string): Promise<boolean> {
  return sendEvent(ADD_AGENT_TO_COMMUNITY_EVEN_TYPE, agentId, communityId, {})
}
