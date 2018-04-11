import { bindNSQL } from 'nano-sql-react'
import React from 'react'
import {currentUser} from './state/GlobalState'
import AccountStatus from './components/AccountStatus/AccountStatus'
import Rating from './components/Rating/Rating'

const ASnsql = bindNSQL(AccountStatus)
function ASFilled () {
  return <ASnsql userId={currentUser}/>
}

const RatingFilled = bindNSQL(Rating)

export {ASFilled as AccountStatus, RatingFilled as Rating}
