// @flow

import {handleMessageEvent, MESSAGE_EVENT_TYPE} from './MessageEvents'
import {pushEvent, pushSelfEvent} from '../db/EventTable'

export type MessageEventPayload = {
  messageId: string
}

export type EventPayload = MessageEventPayload

export type Event = {
  eventId: number,
  senderId: string,
  communityId: string,
  eventType: 'message',
  payload: EventPayload
}

export function handleEvent (event): Promise<boolean> {
  if (!event || !event.eventType) throw new Error('Improperly formatted event. No eventType.')
  if (!event.communityId) throw new Error('Improperly formatted event. No community id.')
  if (!event.senderId) throw new Error('Improperly formatted event. No sender id.')
  if (!event.eventId) throw new Error('Improperly formatted event. No event id.')

  return applyHandler(event).then(r => {
    pushEvent(event, r)
    return r
  })
}

function applyHandler (event): Promise<boolean> {
  switch (event.eventType) {
    case MESSAGE_EVENT_TYPE: return handleMessageEvent(event)
    default: throw new Error('Could not recognize event type')
  }
}

export async function sendEvent (eventType: string, senderId, communityId: string, payload): Promise<boolean> {
  const eventId = await pushSelfEvent(eventType, communityId, payload)
  return handleEvent({
    eventId: eventId, communityId: communityId, senderId, eventType, payload
  })
}
