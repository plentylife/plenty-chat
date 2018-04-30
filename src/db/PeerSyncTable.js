// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_ID, DB_MODE} from '../state/GlobalState'
import {COMMUNITY_TABLE} from './CommunityTable'
import {MissingProperty} from '../utils/Error'

export const PEER_SYNC_TABLE = 'PeerSync'

const peerSyncTable = nSQL(PEER_SYNC_TABLE).model([
  {key: 'id', type: 'string', props: ['pk']},
  {key: 'peerAgentId', type: 'string'},
  {key: 'communityId', type: COMMUNITY_TABLE},
  // the latest timestamp up to which entries have been synced up. The timestamp is from the peer's perspective
  {key: 'syncedUpTo', type: 'number'}
]).config({mode: DB_MODE || 'PERM', id: DB_ID})

/**
 * Either gives the last know timestamp of synced event (from the perspective of sending agent, not us) or 0
 * @param peerAgentId
 * @param communityId
 */
export function getSyncedUpTo (peerAgentId: string, communityId: string): Promise<number | 0> {
  return nSQL(PEER_SYNC_TABLE).query('select').where(['id', '=', getRowId(peerAgentId, communityId)]).exec()
    .then(r => (r.length > 0 ? r[0].syncedUpTo : 0))
}

export function dumpPeerSyncTable () {
  return nSQL(PEER_SYNC_TABLE).query('select').exec()
}

// todo. this is more of a hack for the time being, when not deferentiating between communities
export function getSyncedUpToInAll (peerAgentId: string): Promise<number | 0> {
  return nSQL(PEER_SYNC_TABLE).query('select', ['syncedUpTo']).where(['peerAgentId', '=', peerAgentId]).exec()
    .then(rows => {
      if (rows.length === 0) return 0
      const times = rows.map(r => (r.syncedUpTo))
      return Math.max(...times)
    })
}

export function logSync (peerAgentId: string, communityId: string, timestamp: number): Promise<any> {
  if (!peerAgentId) throw new MissingProperty('peerAgentId')
  if (!communityId) throw new MissingProperty('communityId')
  if (!timestamp || timestamp < 0) throw new MissingProperty('timestamp')

  return nSQL(PEER_SYNC_TABLE).query('upsert', {
    id: getRowId(peerAgentId, communityId), peerAgentId, communityId, syncedUpTo: timestamp
  }).exec()
}

function getRowId (peerAgentId, communityId) {
  return peerAgentId + '-' + communityId
}

export default peerSyncTable
