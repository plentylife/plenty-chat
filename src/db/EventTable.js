import {nSQL} from 'nano-sql/lib/index'
import {DB_MODE} from '../state/GlobalState'
import {COMMUNITY_TABLE} from './CommunityTable'
import {AGENT_TABLE} from './AgentTable'

export const EVENT_TABLE = 'Event'

const baseEventModel = [
  {key: 'communityId', type: COMMUNITY_TABLE, props: ['idx']},
  {key: 'timestamp', type: 'number', props: ['idx']},
  {key: 'eventType', type: 'string'},
  {key: 'payload', type: 'map'}
]

const eventModel = baseEventModel.concat([
  // this even id is created by the agent who sent the event
  {key: 'eventId', type: 'int'},
  {key: 'senderId', type: AGENT_TABLE},
  {key: 'handledSuccessfully', type: 'bool'}
])
const eventTable = nSQL(EVENT_TABLE).model(eventModel).config({mode: DB_MODE || 'PERM'})

export function pushEvent (event, handledSuccessfully: boolean): Promise<any> {
  // fixme should payload perhaps be stored as json
  const withTime = Object.assign({timestamp: new Date().getTime(), handledSuccessfully}, event)
  return nSQL(EVENT_TABLE).query('upsert', withTime).exec()
}

/** Returns all events after a given timestamp in a community */
export function getCommunityEvents (communityId: string, timestamp: number): Promise<Array<any>> {
  return nSQL(EVENT_TABLE).query('select')
    .where([['communityId', '=', communityId], 'AND', ['timestamp', '>', timestamp]])
    .orderBy({timestamp: 'asc'}).exec()
}

/** Returns all events after a given timestamp in a community */
export function getEvents (timestamp: number): Promise<Array<any>> {
  return nSQL(EVENT_TABLE).query('select').where(['timestamp', '>', timestamp])
    .orderBy({timestamp: 'asc'}).exec()
}

/* Events coming from ourselves */

export const SELF_EVENT_TABLE = 'SelfEvent'

const selfEventModel = baseEventModel.concat([
  {key: 'eventId', type: 'int', props: ['pk', 'ai']}
])
const selfEventTable = nSQL(SELF_EVENT_TABLE).model(selfEventModel).config({mode: DB_MODE || 'PERM'})

/**
 * @return the id of the event
 */
export function pushSelfEvent (eventType: string, communtyId: string, payload: Object): Promise<number> {
  const row = Object.assign({eventType: eventType, timestamp: new Date().getTime(), communityId: communtyId}, payload)
  return nSQL(SELF_EVENT_TABLE).query('upsert', row).exec().then(r => {
    return r[0].affectedRows[0].eventId
  })
}

export {eventTable, selfEventTable}
