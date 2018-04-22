// @flow
// import 'babel-polyfill'

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

import './db/index'

function plentyInit () {
  console.log('Initializing Plenty')
  console.log('DB Mode', DB_MODE)
  console.log('DB Name', process.env.DB_NAME)

  nSQL().connect().then(() => console.log('plentyInit NSQL connected'))

  window.nsql = nSQL
}

function plentyInitSync (agentId, communityId, cb) {
  if (agentId && communityId) {
    console.log('PLETY INTI SYNC')
    setCurrentAgentId(agentId)
    setCurrentCommunityId(communityId)
    cb()

    nSQL().onConnected(() => {
      console.log('DB connected (sync init)')
      startSync(['http://localhost:3000'])
    })
  }
}

export function onChannelView (agentId: string, channelId: string, communityId: string) {
  setCurrentAgentId(agentId)
  setCurrentCommunityId(communityId)

  return nSQL().onConnected(async () => {
    console.log('DB connected (onConnected)')
    await createChannel(agentId, channelId, communityId)
    await addAgentToCommunity(agentId, communityId)
  })
}

export {AccountStatus, MessageRating, NotEnoughFundsForMessageModal,
  sendMessage, hasEnoughFundsToSendMessage,
  plentyInit, plentyInitSync,
  nSQL
}
