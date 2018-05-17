// @flow

import {AGENT_TABLE, AGENT_WALLET_TABLE, CHANNEL_TABLE, MESSAGE_TABLE} from './tableNames'
import {nSQL} from 'nano-sql'

import './AgentTable'
import './SettingsTable'
import {COMMUNITY_TABLE} from './CommunityTable'
import {EVENT_TABLE, SELF_EVENT_TABLE} from './EventTable'
import {PEER_SYNC_TABLE} from './PeerSyncTable'
import {RATING_TABLE} from './RatingTable'
import {hasEnoughFundsNum} from '../accounting/Accounting'
import type {Wallet} from './AgentWalletTable'
import {getWalletsInCommunity} from './AgentWalletTable'

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

export function getWalletsNearLimit (communityId: string, closeBy: number): Promise<Array<Wallet>> {
  return getWalletsInCommunity(communityId).then(ws => {
    return ws.filter(w => {
      return !hasEnoughFundsNum(w.balance, w.creditLimit, closeBy)
    })
  })
}
