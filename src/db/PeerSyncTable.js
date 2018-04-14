// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_MODE} from '../state/GlobalState'
import {COMMUNITY_TABLE} from './CommunityTable'

export const PEER_SYNC_TABLE = 'PeerSync'

const agentTable = nSQL(PEER_SYNC_TABLE).model([
  {key: 'id', type: 'uuid', props: ['pk', 'ai']},
  {key: 'peer', type: 'string', props: ['idx']},
  {key: 'communityId', type: COMMUNITY_TABLE},
  // the latest timestamp up to which entries have been synced up. The timestamp is from the peer's perspective
  {key: 'syncedUpTo', type: 'number'}
]).config({mode: DB_MODE || 'PERM'})

export default agentTable
