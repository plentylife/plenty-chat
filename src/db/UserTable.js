import {nSQL} from 'nano-sql/lib/index'

const userTable = nSQL('balance').model([
  // {key: 'id', type: 'int', props: ['pk', 'ai']},
  {key: 'userId', type: 'string', props: ['pk']},
  {key: 'balance', type: 'int'}
]).config({mode: DB_MODE ? DB_MODE : 'PERM'}) // eslint-disable-line
// .views([{
//   name: 'get_balance_by_id',
//   args: ['userId: string'],
//   call: (opts, db) => {
//     return db.query('select', ['balance']).where(['userId', '=', opts.userId])
//   }
// }])

userTable.connect()

export function getBalanceById (userId) {
  return userTable.query('select', ['balance']).where(['userId', '=', userId]).exec()
}

export default userTable
