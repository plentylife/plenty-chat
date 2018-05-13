// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_ID, DB_MODE} from '../state/GlobalState'
import {COMMUNITY_TABLE} from './CommunityTable'
import {CHANNEL_TABLE, MESSAGE_TABLE} from './tableNames'

const channelTable = nSQL(CHANNEL_TABLE).model([
  {key: 'channelId', type: 'string', props: ['pk']},
  {key: 'communityId', type: COMMUNITY_TABLE},
  {key: 'messages', type: MESSAGE_TABLE + '[]', props: ['channelId']}
]).config({mode: DB_MODE || 'PERM', id: DB_ID})

export function getCommunityOfChannel (channelId: string): Promise<string> {
  return nSQL(CHANNEL_TABLE).query('select').where(['channelId', '=', channelId]).exec().then(r => {
    return r.length > 0 ? r[0].communityId : null
  })
}

export function setCommunityOfChannel (channelId: string, communityId: string): Promise<void> {
  return nSQL(CHANNEL_TABLE).query('upsert', {
    channelId, communityId
  }).exec()
}

export default channelTable
