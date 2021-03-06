// @flow

import {sendEvent} from '../events'
import {RATING_EVENT_TYPE} from '../events/RatingEvents'
import type {RatingEventPayload} from '../events/RatingEvents'
import {getCommunityOfMsg} from '../db'
import {CommunityIdNotInferrable} from '../utils/Error'

/**
 * Calculates a rating (can never be 0) and puts it into the database
 * @param msgId
 * @param {string} agentId
 * @param {int} rating
 * @param {int} ratingMax
 * @return {Promise} resolves when db finishes setting the rating
 */
export async function rateMessage (msgId: string, agentId: string, rating: number, ratingMax: number) {
  if (rating <= 0) throw new Error('rating has to be positive and above zero')
  if (rating > ratingMax) throw new Error('rating cannot be higher than maximum')
  if (ratingMax <= 1) throw new Error('Maximum rating has to be positive and above one')

  const communityId = await getCommunityOfMsg(msgId)
  if (!communityId) throw new CommunityIdNotInferrable()

  const r = (rating - 1) / (ratingMax - 1) // ratingMax has to be more than one
  const p: RatingEventPayload = {
    messageId: msgId,
    rating: r
  }
  return sendEvent(RATING_EVENT_TYPE, agentId, communityId, p)
}
