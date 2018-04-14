// @flow

import {MESSAGE_TABLE} from './MessageTable'
import {CHANNEL_TABLE} from './ChannelTable'
import {nSQL} from 'nano-sql'

export function getCommunityOfMsg (msgId: string): Promise<string | null> {
  return nSQL(MESSAGE_TABLE).query('select', [cn(CHANNEL_TABLE, 'communityId')])
    .join({
      type: 'inner', table: CHANNEL_TABLE, where: [cn(MESSAGE_TABLE, 'channelId'), '=', cn(CHANNEL_TABLE, 'channelId')]
    })
    .where([cn(MESSAGE_TABLE, 'id'), '=', msgId])
    .exec().then(r => {
      return r.length > 0 ? r[0][cn(CHANNEL_TABLE, 'communityId')] : null
    })
}

function cn (table: string, columnName): string {
  return table + '.' + columnName
}
