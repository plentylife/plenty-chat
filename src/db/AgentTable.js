// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_ID, DB_MODE} from '../state/GlobalState'

export const AGENT_TABLE = 'Agent'

export type AgentRow = {
  agentId: string,
  email: string
}

const agentTable = nSQL(AGENT_TABLE).model([
  // {key: 'id', type: 'int', props: ['pk', 'ai']},
  {key: 'agentId', type: 'string', props: ['pk']}
]).config({mode: DB_MODE || 'PERM', id: DB_ID})

export default agentTable
