// @flow
import type {Event} from './index'
import {InappropriateAction, MissingPayload, MissingProperty} from '../utils/Error'
import {setRating} from '../db/RatingTable'
import {getMessage} from '../db/MessageTable'

export const RATING_EVENT_TYPE: 'rating' = 'rating'

export type RatingEventPayload = {
  messageId: string,
  rating: number
}

export async function handleRatingEvent (event: Event): Promise<boolean> {
  const payload = validatePayload(event.payload)

  const msg = await getMessage(payload.messageId)
  if (msg.senderId === event.senderId) throw new CannotRateOwnMessage()

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

export class CannotRateOwnMessage extends InappropriateAction {}
