// @flow

import {sendEvent} from '../events'
import {MESSAGE_EVENT_TYPE} from '../events/MessageEvents'
import {getCommunity} from '../db/ChannelTable'

/**
 * Takes a message and packages it into an event
 *
 * @param agentId
 * @param communityId
 * @param messageId
 * @return false if cannot send, or true if successful
 */
export async function sendMessage (agentId: string, channelId: string, messageId: string): Promise<boolean> {
  console.log('sendMessage function triggered', agentId, channelId, messageId)
  const communityId = await getCommunity(channelId)
  if (!communityId) throw new Error('No such channel exists')
  return sendEvent(MESSAGE_EVENT_TYPE, agentId, communityId, {messageId, channelId})
}
