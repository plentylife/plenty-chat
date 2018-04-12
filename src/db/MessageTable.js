// @flow

import {nSQL} from 'nano-sql/lib/index'
import {COMMUNITY_TABLE} from './CommunityTable'
import {DB_MODE} from '../state/GlobalState'

export const MESSAGE_TABLE = 'Message'

export type MessageRow = {id: string, senderId: string, communityId: string}

const messageTable = nSQL(MESSAGE_TABLE).model([
  {key: 'id', type: 'string', props: ['pk']},
  {key: 'senderId', type: 'string'},
  {key: 'communityId', type: COMMUNITY_TABLE}
]).config({mode: DB_MODE || 'PERM'})

export function pushMessage (id: string, senderId: string, communityId: string): Promise<void> {
  // console.log('pushing message with id', id)
  if (!id) throw new Error('Message must have id')
  if (!senderId) throw new Error('Message must have sender')
  if (!communityId) throw new Error('Message must have community')

  return nSQL(MESSAGE_TABLE).query('upsert', {
    id: id, senderId: senderId, communityId: communityId
  }).exec()
}

export function getMessage (id: string): Promise<MessageRow> {
  return nSQL(MESSAGE_TABLE).query('select').where(['id', '=', id]).exec().then(r => {
    // console.log('getting message (query done) with', id, r)
    return (r.length > 0 ? r[0] : null)
  })
}

export default messageTable
