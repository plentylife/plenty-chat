// @flow

import {sendEvent} from '../events'
import {CREATE_CHANNEL_EVENT_TYPE} from '../events/ChannelEvents'

export async function createChannel (agentId: string, channelId: string, communityId: string): Promise<boolean> {
  return sendEvent(CREATE_CHANNEL_EVENT_TYPE, agentId, communityId, {channelId})
}
