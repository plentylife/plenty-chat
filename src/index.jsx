import {bindNSQL} from 'nano-sql-react'
import AccountStatus from './components/AccountStatus/AccountStatus'
import Rating from './components/Rating/Rating'
import {nSQL} from 'nano-sql'
import {currentAgentId, currentCommunityId, DB_MODE} from './state/GlobalState'
import {setBalance} from './db/AgentWalletTable'

const AccountStatusSql = bindNSQL(AccountStatus)
const RatingSql = bindNSQL(Rating)

function plentyInit () {
  console.log('Initializing Plenty')
  console.log('DB Mode', DB_MODE)

  nSQL().connect()

  /* TESTING MM INTEGRATION; REMOVE */
  nSQL().onConnected(() => {
    setBalance(currentAgentId, currentCommunityId, 20)
  })

  window.nsql = nSQL
  /* END: TESTING MM INTEGRATION; REMOVE */
}

export {AccountStatusSql as AccountStatus, RatingSql as Rating, plentyInit, currentAgentId, currentCommunityId}
