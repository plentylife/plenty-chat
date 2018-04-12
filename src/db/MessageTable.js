import {nSQL} from 'nano-sql/lib/index'
import {COMMUNITY_TABLE} from './CommunityTable'

export const MESSAGE_TABLE = 'Message'

const messageTable = nSQL(MESSAGE_TABLE).model([
  {key: 'id', type: 'string', props: ['pk']},
  {key: 'community', type: COMMUNITY_TABLE}
]).config({mode: DB_MODE ? DB_MODE : 'PERM'}) // eslint-disable-line

export default messageTable
