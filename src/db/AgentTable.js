// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_ID, DB_MODE} from '../state/GlobalState'
import {rowOrNull} from './utils'
import {AGENT_TABLE, AGENT_WALLET_TABLE} from './tableNames'

export type AgentRow = {
  agentId: string,
  email: string,
  lastNotification: number
}

const agentTable = nSQL(AGENT_TABLE).model([
  {key: 'agentId', type: 'string', props: ['pk']},
  {key: 'email', type: 'string'},
  {key: 'lastNotification', type: 'number', props: ['idx']},
  {key: 'wallets', type: AGENT_WALLET_TABLE + '[]', props: ['ref=>agentId']}
]).config({mode: DB_MODE || 'PERM', id: DB_ID})

export function pushAgent (agentId: string, email: string): Promise<AgentRow | null> {
  return nSQL(AGENT_TABLE).query('upsert', {
    agentId, email, lastNotification: -1
  }).exec().then(rowOrNull)
}

export function registerNotification (agentId: string, time: number = 0): Promise<AgentRow | null> {
  return nSQL(AGENT_TABLE).query('upsert', {
    agentId, lastNotification: time || new Date().getTime()
  }).exec().then(rowOrNull)
}

export function getAgentsByNotificationTime (before: number): Promise<Array<AgentRow>> {
  return nSQL(AGENT_TABLE).query('select').orm(['wallets']).where(['lastNotification', '<', before]).exec()
}

export default agentTable
