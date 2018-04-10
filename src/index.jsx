import { DatabaseEvent } from "nano-sql";
import * as React from "react";
import { nSQL } from 'nano-sql'
import { bindNSQL } from 'nano-sql-react'

import AccountStatus from './components/AccountStatus/AccountStatus'

// let currentUser = 'anton'
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

const asnsql = bindNSQL(AccountStatus)
export {asnsql as AccountStatus}
