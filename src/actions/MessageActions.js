// @flow

import {sendEvent} from '../events'
import {MESSAGE_EVENT_TYPE} from '../events/MessageEvents'

/**
 * Sends message with all appropriate checks
 *
 * @param agentId
 * @param communityId
 * @param messageId
 * @return false if cannot send, or true if successful
 */
export function sendMessage (agentId: string, communityId: string, messageId: string): Promise<boolean> {
  return sendEvent(MESSAGE_EVENT_TYPE, agentId, communityId, {messageId})
}
