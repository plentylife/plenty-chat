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

/**
 *
 * @param id
 * @return {(null | Object)}
 */
export function getMessage (id) {
  return nSQL(MESSAGE_TABLE).query('select').where(['id', '=', id]).exec().then(r => {
    return r.length > 0 ? r[0] : null
  })
}

export default messageTable
