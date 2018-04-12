import {nSQL} from 'nano-sql/lib/index'
import {COMMUNITY_TABLE} from './CommunityTable'
import {DB_MODE} from '../state/GlobalState'

export const MESSAGE_TABLE = 'Message'

const messageTable = nSQL(MESSAGE_TABLE).model([
  {key: 'id', type: 'string', props: ['pk']},
  {key: 'communityId', type: COMMUNITY_TABLE}
]).config({mode: DB_MODE || 'PERM'})

export function createMessage (id, communityId) {
  return nSQL(MESSAGE_TABLE).query('upsert', {
    id: id, communityId: communityId
  }).exec()
}

export default messageTable
