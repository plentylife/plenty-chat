// @flow
import type {Event} from './index'
import {InappropriateAction, MissingDatabaseEntry, MissingPayload, MissingProperty} from '../utils/Error'
import {setRating} from '../db/RatingTable'
import {getMessage} from '../db/MessageTable'
import {accountingForMessageRating} from '../accounting/Accounting'

export const RATING_EVENT_TYPE: 'rating' = 'rating'

export type RatingEventPayload = {
  messageId: string,
  rating: number,
  messageSenderId: ?string
}

export async function handleRatingEvent (event: Event): Promise<boolean> {
  const payload = validatePayload(event.payload)

  let msgSenderId = payload.messageSenderId
  if (!msgSenderId) {
    const msg = await getMessage(payload.messageId)
    if (msg === null) throw new MissingDatabaseEntry('There is not such message with id ' + payload.messageId)
    msgSenderId = msg.senderId
  }
  if (msgSenderId === event.senderId) throw new CannotRateOwnMessage()

  await accountingForMessageRating(payload.messageId, msgSenderId, event.senderId, payload.rating, event.communityId)
  return setRating(payload.messageId, event.senderId, payload.rating).then(r => (r.length > 0))
}

function validatePayload (payload: Object): RatingEventPayload {
  if (!payload.rating && payload.rating !== 0) throw new MissingProperty('rating')
  if (!payload.messageId) throw new MissingPayload('messageId')
  if (payload.rating < 0) throw new InvalidRating('cannot be below zero')
  if (payload.rating > 1) throw new InvalidRating('cannot be above 1')

  return payload
}

export class InvalidRating extends Error {}

export class CannotRateOwnMessage extends InappropriateAction {
  constructor () {
    super('Cannot rate your own message')
  }
}
