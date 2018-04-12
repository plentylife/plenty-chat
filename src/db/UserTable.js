import {nSQL} from 'nano-sql/lib/index'
import {DB_MODE} from '../state/GlobalState'

export const USER_TABLE = 'User'

const userTable = nSQL(USER_TABLE).model([
  // {key: 'id', type: 'int', props: ['pk', 'ai']},
  {key: 'userId', type: 'string', props: ['pk']},
  {key: 'balance', type: 'int'}
]).config({mode: DB_MODE || 'PERM'})

export function getBalanceById (userId) {
  return userTable.query('select', ['balance']).where(['userId', '=', userId]).exec()
}

export default userTable
