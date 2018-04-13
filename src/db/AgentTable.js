// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_MODE} from '../state/GlobalState'

export const AGENT_TABLE = 'Agent'

const agentTable = nSQL(AGENT_TABLE).model([
  // {key: 'id', type: 'int', props: ['pk', 'ai']},
  {key: 'agentId', type: 'string', props: ['pk']}
]).config({mode: DB_MODE || 'PERM'})

export default agentTable
