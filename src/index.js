import { nSQL } from 'nano-sql'

let currentUser = 'anton'

// inserting test data for now
let balanceTable = nSQL('balance').model([
  {key: 'id', type: 'int', props: ['pk', 'ai']},
  {key: 'userId', type: 'string'},
  {key: 'balance', type: 'int'}
]).config({mode: 'TEMP'})

balanceTable.connect().then((res) => {
  return nSQL().query('upsert', {
    userId: 'anton', balance: 20
  }).exec()
})

export {default as AccountStatus} from './components/AccountStatus/AccountStatus'
