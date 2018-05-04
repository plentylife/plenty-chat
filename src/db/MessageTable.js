// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_ID, DB_MODE} from '../state/GlobalState'
import {CHANNEL_TABLE} from './ChannelTable'
// import {COMMUNITY_TABLE} from './CommunityTable'

export const MESSAGE_TABLE = 'Message'

export type MessageRow = {id: string, senderId: string, channelId: string}

const messageTable = nSQL(MESSAGE_TABLE).model([
  {key: 'id', type: 'string', props: ['pk']},
  {key: 'senderId', type: 'string'},
  {key: 'channelId', type: CHANNEL_TABLE}
]).config({mode: DB_MODE || 'PERM', id: DB_ID})

export function pushMessage (id: string, senderId: string, channelId: string): Promise<void> {
  // console.log('pushing message with id', id)
  if (!id) throw new Error('Message must have id')
  if (!senderId) throw new Error('Message must have sender')
  if (!channelId) throw new Error('Message must have a channel')

  return nSQL(MESSAGE_TABLE).query('upsert', {
    id: id, senderId: senderId, channelId: channelId
  }).exec()
}

export function getMessage (id: string): Promise<MessageRow | null> {
  return nSQL(MESSAGE_TABLE).query('select').where(['id', '=', id]).exec().then(r => {
    // console.log('getting message (query done) with', id, r)
    return (r.length > 0 ? r[0] : null)
  })
}

export default messageTable
