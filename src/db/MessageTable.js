// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_ID, DB_MODE} from '../state/GlobalState'
import {CHANNEL_TABLE, MESSAGE_TABLE} from './tableNames'
import {Decimal} from 'decimal.js'
import {rowOrNull} from './utils'

export type MessageRow = {id: string, senderId: string, channelId: string, timestamp: number, fundsCollected: number}

const messageTable = nSQL(MESSAGE_TABLE).model([
  {key: 'id', type: 'string', props: ['pk']},
  {key: 'senderId', type: 'string'},
  {key: 'channelId', type: CHANNEL_TABLE, props: ['ref=>messages[]']},
  {key: 'timestamp', type: 'number', props: ['idx']},
  {key: 'fundsCollected', type: 'number', default: 0}
]).config({mode: DB_MODE || 'PERM', id: DB_ID})

export function pushMessage (id: string, senderId: string, channelId: string): Promise<null | MessageRow> {
  // console.log('pushing message with id', id)
  if (!id) throw new Error('Message must have id')
  if (!senderId) throw new Error('Message must have sender')
  if (!channelId) throw new Error('Message must have a channel')

  return nSQL(MESSAGE_TABLE).query('upsert', {
    id: id, senderId: senderId, channelId: channelId, timestamp: (new Date().getTime())
  }).exec().then(rowOrNull)
}

export function getMessage (id: string): Promise<MessageRow | null> {
  return nSQL(MESSAGE_TABLE).query('select').where(['id', '=', id]).exec().then(r => {
    // console.log('getting message (query done) with', id, r)
    return (r.length > 0 ? r[0] : null)
  })
}

export function setMessageFunds (id: string, amount: Decimal): Promise<MessageRow | null> {
  return nSQL(MESSAGE_TABLE).query('upsert', {id, fundsCollected: amount.toNumber()}).exec().then(rowOrNull)
}

export function getMessagesForNotifications (after: number): Promise<Array<MessageRow & {communityId: string}>> {
  return nSQL(MESSAGE_TABLE).query('select').orm(['channelId']).where(['timestamp', '>', after]).exec()
}

export default messageTable
