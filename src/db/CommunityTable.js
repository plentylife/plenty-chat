import {nSQL} from 'nano-sql/lib/index'

export const COMMUNITY_TABLE = 'Message'

const communityTable = nSQL(COMMUNITY_TABLE).model([
  {key: 'id', type: 'uuid', props: ['pk']}
]).config({mode: DB_MODE ? DB_MODE : 'PERM'}) // eslint-disable-line

export default communityTable
