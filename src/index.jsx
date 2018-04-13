// @flow

import {bindNSQL} from 'nano-sql-react'
import AccountStatus from './components/AccountStatus/AccountStatus'
import MessageRating from './components/Rating/MessageRating'
import {nSQL} from 'nano-sql'
import {currentAgentId, currentCommunityId, DB_MODE} from './state/GlobalState'
import {walletExists} from './db/AgentWalletTable'
import {sendMessage} from './actions/MessageActions'
import {hasEnoughFundsToSendMessage, initializeAccount, intializeCommunity} from './accounting/Accounting'
import {communityExists} from './db/CommunityTable'
// import {DEFAULT_CREDIT_LIMIT} from './accounting/AccountingGlobals'
import {NotEnoughFundsForMessageModal} from './components/ErrorModals/NotEnoughFunds'
import {setCommunityOfChannel} from './db/ChannelTable'

const AccountStatusSql = bindNSQL(AccountStatus)

function plentyInit () {
  console.log('Initializing Plenty')
  console.log('DB Mode', DB_MODE)

  nSQL().connect()

  /* TESTING MM INTEGRATION; REMOVE */
  window.nsql = nSQL
  /* END: TESTING MM INTEGRATION; REMOVE */
}

export function onChannelView (agentId: string, channelId: string, communityId: string) {
  nSQL().onConnected(() => {
    // fixme do not reupdate every time
    setCommunityOfChannel(channelId, communityId)
    communityExists(communityId).then(e => {
      if (!e) intializeCommunity(communityId)
    })
    walletExists(agentId, communityId).then(e => {
      if (!e) initializeAccount(agentId, communityId)
    })

    /* TESTING MM INTEGRATION; REMOVE */
    // setTimeout(() => {
    // console.log('setting balance to', -1 * DEFAULT_CREDIT_LIMIT)
    // setBalance(agentId, communityId, -1 * DEFAULT_CREDIT_LIMIT)
    // }, 1000)
    /* END: TESTING MM INTEGRATION; REMOVE */
  })
}

export {AccountStatusSql as AccountStatus, MessageRating, NotEnoughFundsForMessageModal,
  plentyInit, currentAgentId, currentCommunityId,
  sendMessage, hasEnoughFundsToSendMessage}
