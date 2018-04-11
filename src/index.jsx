import { bindNSQL } from 'nano-sql-react'
// import React from 'react'
import AccountStatus from './components/AccountStatus/AccountStatus'
import Rating from './components/Rating/Rating'

const AccountStatusSql = bindNSQL(AccountStatus)
const RatingSql = bindNSQL(Rating)

export {AccountStatusSql as AccountStatus, RatingSql as Rating}
