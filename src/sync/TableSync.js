import {nSQL} from 'nano-sql'
import {MissingProperty} from '../utils/Error'
import {ALL_TABLES} from '../db'
import {SELF_EVENT_TABLE} from '../db/EventTable'

const TABLES_TO_SYNC = ALL_TABLES.filter(t => (t !== SELF_EVENT_TABLE))

const ENTRIES_PER_MESSAGE = 10

type TableSyncMsg = {
  entries: Object, table: string
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
  let batches = []
  for (let s = 0; s < entries.length; s += ENTRIES_PER_MESSAGE) {
    const out = entries.slice(s, s + ENTRIES_PER_MESSAGE)
    batches.push(out)
  }
  return batches.map(b => {
    return {
      entries: b,
      table: tableName
    }
  })
}

export function receiveTableSyncMessage (msg: TableSyncMsg) {
  if (!msg.table) throw new MissingProperty('table name in table sync')
  if (!msg.entries) throw new MissingProperty('table entries in table sync')
  if (!(msg.entries instanceof Array)) throw new TypeError('table entries must be an array')

  return nSQL().loadJS(msg.table, msg.entries)
}
