// @flow

import type {Event} from './index'
import {initializeCommunity} from '../accounting/Accounting'
import {communityExists} from '../db/CommunityTable'
import {setCommunityOfChannel} from '../db/ChannelTable'
import {MissingProperty} from '../utils/Error'

export const CREATE_CHANNEL_EVENT_TYPE: 'createChannel' = 'createChannel'

/**
 * fixme. will also create the community
 * @param event
 * @return {Promise<void>}
 */
export async function handleCreateChannelEvent (event: Event): Promise<boolean> {
  const payload = validatePayload(event.payload)
  await setCommunityOfChannel(payload.channelId, event.communityId)
  return communityExists(event.communityId).then(e => {
    if (!e) {
      return initializeCommunity(event.communityId)
    } else {
      return true
    }
  })
}

function validatePayload (payload: Object) {
  if (!payload.channelId) throw new MissingProperty('channelId')
  return payload
}
