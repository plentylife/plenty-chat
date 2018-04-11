import {nSQL} from 'nano-sql/lib/index'

const balanceTable = nSQL('balance').model([
  {key: 'id', type: 'int', props: ['pk', 'ai']},
  {key: 'userId', type: 'string'},
  {key: 'balance', type: 'int'}
]).config({mode: DB_MODE ? DB_MODE : 'PERM'}) // eslint-disable-line

balanceTable.connect()

export default balanceTable
