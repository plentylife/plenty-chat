// @flow

import {hasEnoughFunds} from '../accounting/Accounting'
import {pushMessage} from '../db/MessageTable'

/**
 * Sends message with all appropriate checks
 *
 * @param userId
 * @param communityId
 * @param messageId
 * @return false if cannot send, or true if successful
 */
export async function sendMessage (userId: string, communityId: string, messageId: string): boolean {
  const fc = await hasEnoughFunds(userId, communityId, 1)
  if (fc) {
    pushMessage(messageId, communityId) // fixme, should happen through events interface
    return true
  }
  return false
}
