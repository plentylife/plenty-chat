import {nSQL} from 'nano-sql/lib/index'
import {DB_MODE} from '../state/GlobalState'

export const COMMUNITY_TABLE = 'Message'

const communityTable = nSQL(COMMUNITY_TABLE).model([
  {key: 'id', type: 'uuid', props: ['pk']}
]).config({mode: DB_MODE || 'PERM'})

export default communityTable
