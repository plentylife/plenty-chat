// @flow

import AccountStatus from './components/AccountStatus/AccountStatus'
import MessageRating from './components/Rating/MessageRating'
import {nSQL} from 'nano-sql'
import {currentAgentId, currentCommunityId, DB_MODE} from './state/GlobalState'
import {walletExists} from './db/AgentWalletTable'
import {sendMessage} from './actions/MessageActions'
import {hasEnoughFundsToSendMessage, initializeAccount, initializeCommunity} from './accounting/Accounting'
import {communityExists} from './db/CommunityTable'
// import {DEFAULT_CREDIT_LIMIT} from './accounting/AccountingGlobals'
import {NotEnoughFundsForMessageModal} from './components/ErrorModals/NotEnoughFunds'
import {setCommunityOfChannel} from './db/ChannelTable'

function plentyInit () {
  console.log('Initializing Plenty')
  console.log('DB Mode', DB_MODE)

  nSQL().connect()

  /* TESTING MM INTEGRATION; REMOVE */
  window.nsql = nSQL
  /* END: TESTING MM INTEGRATION; REMOVE */
}

export function onChannelView (agentId: string, channelId: string, communityId: string) {
  return nSQL().onConnected(async () => {
    // fixme do not reupdate every time
    await setCommunityOfChannel(channelId, communityId)
    await communityExists(communityId).then(e => {
      if (!e) return initializeCommunity(communityId)
    })
    await walletExists(agentId, communityId).then(e => {
      if (!e) return initializeAccount(agentId, communityId)
    })

    /* TESTING MM INTEGRATION; REMOVE */
    // setTimeout(() => {
    // console.log('setting balance to', -1 * DEFAULT_CREDIT_LIMIT)
    // setBalance(agentId, communityId, -1 * DEFAULT_CREDIT_LIMIT)
    // }, 1000)
    /* END: TESTING MM INTEGRATION; REMOVE */
  })
}

export {AccountStatus, MessageRating, NotEnoughFundsForMessageModal,
  plentyInit, currentAgentId, currentCommunityId,
  sendMessage, hasEnoughFundsToSendMessage}
