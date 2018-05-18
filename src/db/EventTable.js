import {nSQL} from 'nano-sql'
import {DB_MODE, DB_ID} from '../state/GlobalState'
import {COMMUNITY_TABLE} from './CommunityTable'
import {AGENT_TABLE} from './tableNames'
import type {Event} from '../events'

export const EVENT_TABLE = 'Event'

const baseEventModel = [
  {key: 'communityId', type: COMMUNITY_TABLE, props: ['idx']},
  {key: 'timestamp', type: 'number', props: ['idx']},
  {key: 'eventType', type: 'string'},
  {key: 'payload', type: 'any'}
]

const eventModel = baseEventModel.concat([
  {key: 'globalEventId', type: 'string', props: ['pk']},
  // this even id is created by the agent who sent the event
  {key: 'agentEventId', type: 'int', props: ['idx']},
  {key: 'senderId', type: AGENT_TABLE, props: ['idx']},
  {key: 'receivedFrom', type: 'string[]'},
  {key: 'handledSuccessfully', type: 'bool'}
])
const eventTable = nSQL(EVENT_TABLE).model(eventModel).config({mode: DB_MODE || 'PERM', id: DB_ID})

export function getEvent (globalEventId: string): Promise<Event | null> {
  return nSQL(EVENT_TABLE).query('select').where(['globalEventId', '=', globalEventId])
    .exec().then(rows => (rows.length > 0 ? rows[0] : null))
}

export async function pushEvent (event: Event, handledSuccessfully: boolean): Promise<any> {
  if (event.receivedFrom && !(event.receivedFrom instanceof Set)) {
    throw new TypeError('Event property `receivedFrom` must be a Set')
  }
  const updated = await updateEvent(event)
  // todo. test received from logging
  if (!updated) {
    const now = new Date().getTime()
    let receivedFrom = []
    if (event.receivedFrom) receivedFrom = Array.from(event.receivedFrom)
    const withTime = Object.assign({}, event, {
      timestamp: now, handledSuccessfully, receivedFrom
    })
    return nSQL(EVENT_TABLE).query('upsert', withTime).exec().then(rs => {
      console.log('inserted rows', rs)
    }).catch(e => {
      console.error('could not insert row into event table', e)
    })
  }
}

/**
 * @return true if event exists, false otherwise
 */
export async function updateEvent (event: Event): Promise<boolean> {
  const existing = await getEvent(event.globalEventId)
  if (existing) {
    if (event.receivedFrom) {
      const exLength = existing.receivedFrom.length
      const receivedFromSet = new Set(existing.receivedFrom)
      event.receivedFrom.forEach(r => receivedFromSet.add(r))
      if (receivedFromSet.size !== exLength) {
        const receivedFrom = Array.from(receivedFromSet)
        return nSQL(EVENT_TABLE).query('upsert', Object.assign({}, existing, {receivedFrom})).exec().then(() => true)
      }
    }
    return true
  }
  return false
}

/** Returns all events after a given timestamp in a community */
export function getCommunityEvents (communityId: string, timestamp: number): Promise<Array<any>> {
  return nSQL(EVENT_TABLE).query('select')
    .where([['communityId', '=', communityId], 'AND', ['timestamp', '>', timestamp]])
    .orderBy({timestamp: 'asc'}).exec().then(es => {
      return es.map(e => (Object.assign({}, e, {receivedFrom: new Set(e.receivedFrom)})))
    })
}

/** Returns all events after a given timestamp in a community */
export function getEvents (timestamp: number): Promise<Array<any>> {
  return nSQL(EVENT_TABLE).query('select').where(['timestamp', '>', timestamp])
    .orderBy({timestamp: 'asc'}).exec().then(es => {
      return es.map(e => (Object.assign({}, e, {receivedFrom: new Set(e.receivedFrom)})))
    })
}

export function getLastEventBy (agentId: string, communityId: string): Promise<Object | null> {
  return nSQL(EVENT_TABLE).query('select')
    .where([['communityId', '=', communityId], 'AND', ['senderId', '=', agentId]])
    .orderBy({'timestamp': 'desc'}).exec().then(rows => {
      if (rows.length > 0) {
        return rows[0]
      } else {
        return null
      }
    })
}

/* Events coming from ourselves */

export const SELF_EVENT_TABLE = 'SelfEvent'

const selfEventModel = baseEventModel.concat([
  {key: 'eventId', type: 'int', props: ['pk', 'ai']}
])
const selfEventTable = nSQL(SELF_EVENT_TABLE).model(selfEventModel).config({mode: DB_MODE || 'PERM', id: DB_ID})

/**
 * @return the id of the event that includes the timestamp
 */
export function pushSelfEvent (eventType: string, communtyId: string, payload: Object): Promise<Object> {
  if (typeof communtyId !== 'string') throw new TypeError('communityId must be a string')
  try {
    const row = Object.assign({eventType: eventType, timestamp: new Date().getTime(), communityId: communtyId}, payload)
    return nSQL(SELF_EVENT_TABLE).query('upsert', row).exec().then(r => {
      const e = r[0].affectedRows[0]
      return {eventId: e.eventId, timestamp: e.timestamp}
    })
  } catch (e) {
    console.error('pushSelfEvent failed', eventType, communtyId, payload, e)
    return Promise.resolve(false)
  }
}

export {eventTable, selfEventTable}
