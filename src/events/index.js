// @flow

import {handleMessageEvent, MESSAGE_EVENT_TYPE} from './MessageEvents'
import {getEvent, pushEvent, pushSelfEvent} from '../db/EventTable'
import {handleRatingEvent, RATING_EVENT_TYPE} from './RatingEvents'
import type {MessageEventPayload} from './MessageEvents'
import type {RatingEventPayload} from './RatingEvents'
import {MissingPayload} from '../utils/Error'
import {ADD_AGENT_TO_COMMUNITY_EVEN_TYPE, handleAddAgentToCommunity} from './AgentEvents'
import {CREATE_CHANNEL_EVENT_TYPE, handleCreateChannelEvent} from './ChannelEvents'
import {
  COMMUNITY_POT_SPLIT,
  DEMURRAGE_EVEN_TYPE,
  handleCommunityPotSplit,
  handleDemurrageEvent
} from './AccountingEvents'
import { timeout, TimeoutError } from 'promise-timeout'

export type EventPayload = MessageEventPayload | RatingEventPayload
export type EventType = (typeof MESSAGE_EVENT_TYPE | typeof RATING_EVENT_TYPE)

export type Event = {
  globalEventId: string,
  agentEventId: number,
  senderId: string,
  communityId: string,
  eventType: EventType,
  payload: EventPayload,
  receivedFrom: Set<string>,
  timestamp: number
}

// todo. make sure that events are handled one after the next
// export let lastEvent = new Promise(resolve => {})
export let lastEvent = Promise.resolve(false)

export async function handleEvent (event: Event): Promise<boolean | Object | Error> {
  try {
    // console.log('Handling Event', event)
    await timeout(lastEvent, 1000 * 60).catch(e => {
      if (e instanceof TimeoutError) console.error('Event timed out. Event body:', event)
    }) // todo. add timeout

    if (!event || !event.eventType) throw new Error('Improperly formatted event. No eventType.')
    if (!event.communityId) throw new Error('Improperly formatted event. No community id.')
    if (!event.senderId) throw new Error('Improperly formatted event. No sender id.')
    if (!event.agentEventId) throw new Error('Improperly formatted event. No agent event id.')
    if (!event.globalEventId) throw new Error('Improperly formatted event. No global event id.')
    if (typeof event.payload !== 'object') throw new MissingPayload()

    const existing = await getEvent(event.globalEventId)
    if (existing != null) {
      console.log(`Event with id ${event.globalEventId} already exists in db`)
      return {code: 'EXISTS'} // fixme, should be variable
    }

    lastEvent = applyHandler(event).then(async r => {
      if (typeof r !== 'boolean') throw new TypeError('PROGRAMMER ERROR. `r` is not a boolean')
      await pushEvent(event, r)
      // console.log('Handled event ' + (r ? 'Successfully' : 'UNsucessfully'), event)
      if (r === false) console.log('Did not handle event succcessfully', JSON.stringify(event))
      return r
    }).catch(async e => {
      console.error(`Failed to handle event: ${e}`, event)
      await pushEvent(event, false)
      return e
    })
  } catch (e) {
    console.log('handleEvent failed totally', e)
  }
  return lastEvent
}

function applyHandler (event: Event): Promise<boolean> {
  switch (event.eventType) {
    case MESSAGE_EVENT_TYPE: return handleMessageEvent(event)
    case RATING_EVENT_TYPE: return handleRatingEvent(event)
    case ADD_AGENT_TO_COMMUNITY_EVEN_TYPE: return handleAddAgentToCommunity(event)
    case CREATE_CHANNEL_EVENT_TYPE: return handleCreateChannelEvent(event)
    case DEMURRAGE_EVEN_TYPE: return handleDemurrageEvent(event)
    case COMMUNITY_POT_SPLIT: return handleCommunityPotSplit(event)
    default: throw new Error('Could not recognize event type')
  }
}

export async function sendEvent (eventType: EventType, senderId: string, communityId: string,
  payload: EventPayload): Promise<boolean> {
  try {
    const eventId = await pushSelfEvent(eventType, communityId, payload) // fixme does not register if failed
    if (eventId !== false) {
      return handleEvent({
        globalEventId: senderId + eventId,
        agentEventId: eventId,
        communityId,
        senderId,
        eventType,
        payload,
        receivedFrom: new Set()
      })
    }
    throw new Error('Something is very wrong with the SelfEvent database. Could not push event in.')
  } catch (e) {
    console.error('sendEvent failed', e)
    return Promise.resolve(false)
  }
}
