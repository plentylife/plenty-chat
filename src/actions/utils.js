// @flow

import {CommunityIdNotInferrable} from '../utils/Error'
import {getCommunityOfMsg} from '../db'
import {getCurrentCommunityId} from '../state/GlobalState'

export async function getCommunityFromMessageOrCurrent (msgId: string) {
  let communityId = await getCommunityOfMsg(msgId)
  let currentCommunity = getCurrentCommunityId()
  if (!communityId && currentCommunity) communityId = currentCommunity
  if (!communityId) throw new CommunityIdNotInferrable()
  return communityId
}
