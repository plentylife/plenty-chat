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
import AgentNameModal from 'QuestionModals/AgentNameModal'
import {startSync} from './sync/SyncClient'
import * as Tutorial from 'Tutorial'
import {onChannelView, provideUserGetterSetter} from './mmintegration'
import MMStyles from './utils/style-utils.scss'
import FrontPage from 'MiscPages/FrontPage'

import './db/index'

function plentyInit () {
  console.log('Initializing Plenty')
  console.log('DB Mode', DB_MODE)
  console.log('DB Name', process.env.DB_NAME)

  nSQL().connect().then(() => console.log('plentyInit NSQL connected'))

  window.nsql = nSQL
}

function plentyInitSync (agentId, communityId, cb, singlePeer) {
  if (agentId && communityId) {
    console.log('PLENTY INIT SYNC with singlePeer', singlePeer)
    setCurrentAgentId(agentId)
    setCurrentCommunityId(communityId)
    cb()

    nSQL().onConnected(() => {
      const peers = singlePeer.length > 0 ? singlePeer : ['http://localhost:3000']
      console.log('DB connected (sync init)', peers)
      startSync(peers)
    })
  }
}

export {AccountStatus, MessageRating, NotEnoughFundsForMessageModal, AgentNameModal, FrontPage,
  sendMessage, hasEnoughFundsToSendMessage,
  plentyInit, plentyInitSync, onChannelView, provideUserGetterSetter,
  nSQL,
  Tutorial, MMStyles
}
