// @flow

import {handleMessageEvent, MESSAGE_EVENT_TYPE} from './MessageEvents'
import {pushEvent, pushSelfEvent} from '../db/EventTable'
import {handleRatingEvent, RATING_EVENT_TYPE} from './RatingEvents'
import type {MessageEventPayload} from './MessageEvents'
import type {RatingEventPayload} from './RatingEvents'
import {MissingPayload} from '../utils/Error'

export type EventPayload = MessageEventPayload | RatingEventPayload
export type EventType = (typeof MESSAGE_EVENT_TYPE | typeof RATING_EVENT_TYPE)

export type Event = {
  eventId: number,
  senderId: string,
  communityId: string,
  eventType: EventType,
  payload: EventPayload
}

export function handleEvent (event: Event): Promise<boolean> {
  if (!event || !event.eventType) throw new Error('Improperly formatted event. No eventType.')
  if (!event.communityId) throw new Error('Improperly formatted event. No community id.')
  if (!event.senderId) throw new Error('Improperly formatted event. No sender id.')
  if (!event.eventId) throw new Error('Improperly formatted event. No event id.')
  if (!event.payload) throw new MissingPayload()

  // fixme put a try catch here to log failed events

  return applyHandler(event).then(r => {
    pushEvent(event, r)
    return r
  })
}

function applyHandler (event: Event): Promise<boolean> {
  switch (event.eventType) {
    case MESSAGE_EVENT_TYPE: return handleMessageEvent(event)
    case RATING_EVENT_TYPE: return handleRatingEvent(event)
    default: throw new Error('Could not recognize event type')
  }
}

export async function sendEvent (eventType: EventType, senderId: string, communityId: string,
  payload: EventPayload): Promise<boolean> {
  const eventId = await pushSelfEvent(eventType, communityId, payload) // fixme does not register if failed
  return handleEvent({
    eventId: eventId, communityId: communityId, senderId, eventType, payload
  })
}
