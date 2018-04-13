// @flow

import {bindNSQL} from 'nano-sql-react'
import AccountStatus from './components/AccountStatus/AccountStatus'
import Rating from './components/Rating/Rating'
import {nSQL} from 'nano-sql'
import {currentAgentId, currentCommunityId, DB_MODE} from './state/GlobalState'
import {setBalance, walletExists} from './db/AgentWalletTable'
import {sendMessage} from './actions/MessageActions'
import {hasEnoughFundsToSendMessage, initializeAccount, intializeCommunity} from './accounting/Accounting'
import {communityExists} from './db/CommunityTable'

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

export function onChannelView (agentId: string, communityId: string) {
  nSQL().onConnected(() => {
    communityExists(communityId).then(e => {
      if (!e) intializeCommunity(communityId)
    })
    walletExists(agentId, communityId).then(e => {
      if (!e) initializeAccount(agentId, communityId)
    })
  })
}

export {AccountStatusSql as AccountStatus, RatingSql as Rating, plentyInit, currentAgentId, currentCommunityId,
  sendMessage, hasEnoughFundsToSendMessage}
