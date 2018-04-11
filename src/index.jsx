import { bindNSQL } from 'nano-sql-react'
import React from 'react'
import {currentUser} from './state/GlobalState'
import AccountStatus from './components/AccountStatus/AccountStatus'

const ASnsql = bindNSQL(AccountStatus)
function ASFilled () {
  return <ASnsql userId={currentUser}/>
}
export {ASFilled as AccountStatus}
