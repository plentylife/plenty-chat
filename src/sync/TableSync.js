import {AGENT_TABLE} from '../db/AgentTable'
import {AGENT_WALLET_TABLE} from '../db/AgentWalletTable'
import {COMMUNITY_TABLE} from '../db/CommunityTable'
import {nSQL} from 'nano-sql'
import {MissingProperty} from '../utils/Error'
import {CHANNEL_TABLE} from '../db/ChannelTable'

const TABLES_TO_SYNC = [AGENT_TABLE, CHANNEL_TABLE, AGENT_WALLET_TABLE, COMMUNITY_TABLE]

type TableSyncMsg = {
  entry: Object, table: string
}

export async function generateAllTableSyncMessages (): Promise<Array<TableSyncMsg>> {
  const byTable = await Promise.all(TABLES_TO_SYNC.map(tn => {
    return _generateTableSyncMessages(tn)
  }))
  const all = []
  return all.concat(...byTable)
}

async function _generateTableSyncMessages (tableName: string): Promise<Array<TableSyncMsg>> {
  const entries = await nSQL(tableName).query('select').exec()
  return entries.map(e => {
    return {
      entry: e,
      table: tableName
    }
  })
}

export function receiveTableSyncMessage (msg: TableSyncMsg) {
  if (!msg.table) throw new MissingProperty('table name in table sync')
  if (!msg.entry) throw new MissingProperty('table entry in table sync')

  return nSQL().loadJS(msg.table, [msg.entry])
}
