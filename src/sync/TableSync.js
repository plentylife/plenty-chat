import {nSQL} from 'nano-sql'
import {MissingProperty} from '../utils/Error'
import {ALL_TABLES} from '../db'
import {EVENT_TABLE, SELF_EVENT_TABLE} from '../db/EventTable'
import {MESSAGE_TABLE} from '../db/MessageTable'
import {logSync, PEER_SYNC_TABLE} from '../db/PeerSyncTable'
import type {Peer} from './index'

const TABLES_TO_SYNC = ALL_TABLES.filter(t => (t !== SELF_EVENT_TABLE && t !== PEER_SYNC_TABLE))
const WITH_TIMESTAMP = [MESSAGE_TABLE, EVENT_TABLE]

const ENTRIES_PER_MESSAGE = 10

type TableSyncMsg = {
  entries: Object, table: string
}

export async function generateAllTableSyncMessages (fromTimestamp: number): Promise<Array<TableSyncMsg>> {
  const byTable = await Promise.all(TABLES_TO_SYNC.map(tn => {
    return _generateTableSyncMessages(tn, fromTimestamp)
  }))
  const all = []
  return all.concat(...byTable)
}

async function _generateTableSyncMessages (tableName: string, fromTimestamp: number): Promise<Array<TableSyncMsg>> {
  let entries
  if (WITH_TIMESTAMP.includes(tableName)) {
    entries = await nSQL(tableName).query('select').where(['timestamp', '>', fromTimestamp]).exec()
  } else {
    entries = await nSQL(tableName).query('select').exec()
  }
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

export function receiveTableSyncMessage (peer: Peer, _msg: TableSyncMsg): Promise<void> {
  let msg = _msg
  if (!msg.table) throw new MissingProperty('table name in table sync')
  if (!msg.entries) throw new MissingProperty('table entries in table sync')
  if (!(msg.entries instanceof Array)) throw new TypeError('table entries must be an array')

  msg = modifyEventMessages(peer, msg)

  return setSyncedUpToTime(peer, msg).then(() => {
    return nSQL().loadJS(msg.table, msg.entries)
  })
}

function modifyEventMessages (peer: Peer, msg: TableSyncMsg) {
  if (msg.table === EVENT_TABLE) {
    const newEntries = msg.entries.map(e => {
      const receivedFrom = []
      if (e.receivedFrom instanceof Array) receivedFrom.concat(e.receivedFrom)
      if (peer.agentId) {
        receivedFrom.push(peer.agentId.trim())
      }
      return Object.assign({}, e, {receivedFrom})
    })
    return Object.assign({}, msg, {entries: newEntries})
  } else {
    return msg
  }
}

function setSyncedUpToTime (peer: Peer, msg: TableSyncMsg): Promise<void> {
  if (msg.table === EVENT_TABLE) {
    const times = msg.entries.map(e => (e.timestamp))
    const latest = Math.max(...times)
    // fixme hack. need to log for each individual community
    return logSync(peer.agentId, 'table-sync-hack', latest)
  } else {
    return Promise.resolve()
  }
}
