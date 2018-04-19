// @flow

import AccountStatus from './components/AccountStatus/AccountStatus'
import MessageRating from './components/Rating/MessageRating'
import {nSQL} from 'nano-sql'
import {
  DB_MODE,
  setCurrentAgentId,
  setCurrentCommunityId
} from './state/GlobalState'
import {sendMessage} from './actions/MessageActions'
import {hasEnoughFundsToSendMessage} from './accounting/Accounting'
// import {DEFAULT_CREDIT_LIMIT} from './accounting/AccountingGlobals'
import {NotEnoughFundsForMessageModal} from './components/ErrorModals/NotEnoughFunds'
import {startSync} from './sync/SyncClient'
import {createChannel} from './actions/ChannelActions'
import {addAgentToCommunity} from './actions/AgentActions'

function plentyInit () {
  console.log('Initializing Plenty')
  console.log('DB Mode', DB_MODE)
  console.log('DB Name', process.env.DB_NAME)

  nSQL().connect().then(() => {
    console.log('DB connected (connect.then)')
    startSync(['http://localhost:3000'])
  })

  window.nsql = nSQL
}

export function onChannelView (agentId: string, channelId: string, communityId: string) {
  setCurrentAgentId(agentId)
  setCurrentCommunityId(communityId)
  plentyInit()

  return nSQL().onConnected(async () => {
    // fixme do not reupdate every time

    console.log('DB connected (onConnected)')
    await createChannel(agentId, channelId, communityId)
    await addAgentToCommunity(agentId, communityId)

    /* TESTING MM INTEGRATION; REMOVE */
    // setTimeout(() => {
    // console.log('setting balance to', -1 * DEFAULT_CREDIT_LIMIT)
    // setBalance(agentId, communityId, -1 * DEFAULT_CREDIT_LIMIT)
    // }, 1000)
    /* END: TESTING MM INTEGRATION; REMOVE */
  })
}

export {AccountStatus, MessageRating, NotEnoughFundsForMessageModal,
  sendMessage, hasEnoughFundsToSendMessage}
