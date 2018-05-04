// @flow

import {handleMessageEvent, MESSAGE_EVENT_TYPE} from './MessageEvents'
import {EVENT_TABLE, getEvent, pushEvent, pushSelfEvent} from '../db/EventTable'
import {handleRatingEvent, RATING_EVENT_TYPE} from './RatingEvents'
import type {MessageEventPayload} from './MessageEvents'
import type {RatingEventPayload} from './RatingEvents'
import {ExistsInDB, MissingPayload} from '../utils/Error'
import {ADD_AGENT_TO_COMMUNITY_EVEN_TYPE, handleAddAgentToCommunity} from './AgentEvents'
import {CREATE_CHANNEL_EVENT_TYPE, handleCreateChannelEvent} from './ChannelEvents'
import {
  COMMUNITY_POT_SPLIT,
  DEMURRAGE_EVEN_TYPE,
  handleCommunityPotSplit,
  handleDemurrageEvent
} from './AccountingEvents'
import {CONVERT_TO_TASK_EVENT_TYPE, handleConvertToTaskEvent} from './TaskEvents'
import {_backlogEvent} from './queue'

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
  timestamp: number,
  isSync: ?boolean
}

export type EventResult = {
  status: boolean,
  error: ?Error,
  value: ?any
}

export var handledCount = 0
export var _handleEventErrors = []

export function handleEvent (event: Event): Promise<boolean | Error | EventResult> {
  return _backlogEvent(event)
}

export async function _handleEvent (event: Event): Promise<boolean | Error | EventResult> {
  try {
    handledCount += 1
    // console.log('Handling Event', event)

    if (!event || !event.eventType) throw new Error('Improperly formatted event. No eventType.')
    if (!event.communityId) throw new Error('Improperly formatted event. No community id.')
    if (!event.senderId) throw new Error('Improperly formatted event. No sender id.')
    if (!event.agentEventId) throw new Error('Improperly formatted event. No agent event id.')
    if (!event.globalEventId) throw new Error('Improperly formatted event. No global event id.')
    if (typeof event.payload !== 'object') throw new MissingPayload()

    const existing = await getEvent(event.globalEventId)
    if (existing != null) {
      console.log(`Event with id ${event.globalEventId} already exists in db`)
      return new ExistsInDB(event.globalEventId, EVENT_TABLE) // fixme, should be variable
    }

    return applyHandler(event).then(async result => {
      let status = result
      if (typeof result !== 'boolean') {
        if (typeof result.status !== 'boolean') throw new TypeError('PROGRAMMER ERROR. `r` is not a boolean or EventResult')
        status = (result: EventResult).status
      }
      await pushEvent(event, status)
      if (status === false) console.log('Did not handle event successfully', JSON.stringify(event))
      return result
    }).catch(async e => {
      console.error(`Failed to handle event: ${e}`, event, e.stack)
      await pushEvent(event, false)
      if (process.env.NODE_ENV === 'test') _handleEventErrors.push(e)
      return e
    })
  } catch (e) {
    if (process.env.NODE_ENV === 'test') _handleEventErrors.push(e)
    console.error('handleEvent failed totally', e)
    return e
  }
}

function applyHandler (event: Event): Promise<boolean> {
  switch (event.eventType) {
    case MESSAGE_EVENT_TYPE: return handleMessageEvent(event)
    case RATING_EVENT_TYPE: return handleRatingEvent(event)
    case ADD_AGENT_TO_COMMUNITY_EVEN_TYPE: return handleAddAgentToCommunity(event)
    case CREATE_CHANNEL_EVENT_TYPE: return handleCreateChannelEvent(event)
    case DEMURRAGE_EVEN_TYPE: return handleDemurrageEvent(event)
    case COMMUNITY_POT_SPLIT: return handleCommunityPotSplit(event)
    case CONVERT_TO_TASK_EVENT_TYPE: return handleConvertToTaskEvent(event)
    default: throw new Error(`Could not recognize event type '${event.eventType}'`)
  }
}

export async function sendEvent (eventType: EventType, senderId: string, communityId: string,
  payload: EventPayload): Promise<boolean | EventResult> {
  try {
    const eventIdBits = await pushSelfEvent(eventType, communityId, payload) // fixme does not register if failed
    if (eventIdBits !== false) {
      const agentEventId = `${eventIdBits.eventId}-${eventIdBits.timestamp}`
      return handleEvent({
        globalEventId: senderId + '-' + agentEventId,
        agentEventId,
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
