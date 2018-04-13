// @flow

import {sendEvent} from '../events'
import {MESSAGE_EVENT_TYPE} from '../events/MessageEvents'

/**
 * Sends message with all appropriate checks
 *
 * @param userId
 * @param communityId
 * @param messageId
 * @return false if cannot send, or true if successful
 */
export function sendMessage (userId: string, communityId: string, messageId: string): Promise<boolean> {
  return sendEvent(MESSAGE_EVENT_TYPE, userId, communityId, {messageId})
}