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
import {DEFAULT_CREDIT_LIMIT} from './accounting/AccountingGlobals'
import {NotEnoughFundsForMessageModal} from './components/ErrorModals/NotEnoughFunds'

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

    /* TESTING MM INTEGRATION; REMOVE */
    setTimeout(() => {
      console.log('setting balance to', -1 * DEFAULT_CREDIT_LIMIT)
      setBalance(agentId, communityId, -1 * DEFAULT_CREDIT_LIMIT)
    }, 1000)
    /* END: TESTING MM INTEGRATION; REMOVE */
  })
}

export {AccountStatusSql as AccountStatus, RatingSql as Rating, NotEnoughFundsForMessageModal,
  plentyInit, currentAgentId, currentCommunityId,
  sendMessage, hasEnoughFundsToSendMessage}
