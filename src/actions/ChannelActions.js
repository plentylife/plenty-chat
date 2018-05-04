// @flow

import {sendEvent} from '../events'
import {CREATE_CHANNEL_EVENT_TYPE} from '../events/ChannelEvents'
import {getCommunityOfChannel} from '../db/ChannelTable'

export async function createChannel (agentId: string, channelId: string, communityId: string, force:boolean = false): Promise<boolean | null> {
  const exCom = await getCommunityOfChannel(channelId)
  if (exCom !== communityId || force) {
    console.log('creating channel', agentId, channelId, communityId)
    return sendEvent(CREATE_CHANNEL_EVENT_TYPE, agentId, communityId, {channelId})
  } else {
    return Promise.resolve(null)
  }
}
