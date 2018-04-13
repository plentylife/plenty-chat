// @flow

import {sendEvent} from '../events'
import {MESSAGE_EVENT_TYPE} from '../events/MessageEvents'
import {getCommunity} from '../db/ChannelTable'

/**
 * Sends message with all appropriate checks
 *
 * @param agentId
 * @param communityId
 * @param messageId
 * @return false if cannot send, or true if successful
 */
export async function sendMessage (agentId: string, channelId: string, messageId: string): Promise<boolean> {
  const communityId = await getCommunity(channelId)
  if (!communityId) throw new Error('No such channel exists')
  return sendEvent(MESSAGE_EVENT_TYPE, agentId, communityId, {messageId, channelId})
}
