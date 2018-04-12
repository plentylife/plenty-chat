// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_MODE} from '../state/GlobalState'

export const USER_TABLE = 'User'

const userTable = nSQL(USER_TABLE).model([
  // {key: 'id', type: 'int', props: ['pk', 'ai']},
  {key: 'userId', type: 'string', props: ['pk']}
]).config({mode: DB_MODE || 'PERM'})

export default userTable
