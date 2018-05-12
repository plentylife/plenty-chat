// @flow

import {MESSAGE_TABLE} from './MessageTable'
import {CHANNEL_TABLE} from './ChannelTable'
import {nSQL} from 'nano-sql'

import {AGENT_TABLE} from './tableNames'
import {AGENT_WALLET_TABLE} from './tableNames'
import {COMMUNITY_TABLE} from './CommunityTable'
import {EVENT_TABLE, SELF_EVENT_TABLE} from './EventTable'
import {PEER_SYNC_TABLE} from './PeerSyncTable'
import {RATING_TABLE} from './RatingTable'

export const ALL_TABLES = [
  AGENT_TABLE, AGENT_WALLET_TABLE, CHANNEL_TABLE, COMMUNITY_TABLE, EVENT_TABLE, SELF_EVENT_TABLE, MESSAGE_TABLE,
  PEER_SYNC_TABLE, RATING_TABLE
]

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

export function rowOrNull <T> (rows: any): (T | null) {
  if (rows instanceof Array && rows.length > 0) {
    const fr = rows[0]
    if (fr instanceof Object && fr.affectedRows) {
      return fr.affectedRows.length > 0 ? fr.affectedRows[0] : null
    }
    return fr
  }
  return null
}
