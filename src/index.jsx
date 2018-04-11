import { nSQL } from 'nano-sql'
import { bindNSQL } from 'nano-sql-react'

import AccountStatus from './components/AccountStatus/AccountStatus'

// let currentUser = 'anton'

const asnsql = bindNSQL(AccountStatus)
export {asnsql as AccountStatus}
