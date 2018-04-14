// @flow
import type {Event} from './index'
import {MissingPayload, MissingProperty} from '../utils/Error'
import {setRating} from '../db/RatingTable'

export const RATING_EVENT_TYPE: 'rating' = 'rating'

export type RatingEventPayload = {
  messageId: string,
  rating: number
}

export function handleRatingEvent (event: Event): Promise<boolean> {
  const payload = validatePayload(event.payload)
  return setRating(payload.messageId, event.senderId, payload.rating)
}

function validatePayload (payload: Object): RatingEventPayload {
  if (!payload.rating && payload.rating !== 0) throw new MissingProperty('rating')
  if (!payload.messageId) throw new MissingPayload('messageId')
  if (payload.rating < 0) throw new InvalidRating('cannot be below zero')
  if (payload.rating > 1) throw new InvalidRating('cannot be above 1')

  return payload
}

export class InvalidRating extends Error {}
