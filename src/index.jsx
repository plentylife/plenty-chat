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
// import {startSync} from './sync/SyncClient'
import {createChannel} from './actions/ChannelActions'
import {addAgentToCommunity} from './actions/AgentActions'

import './db/index'
import {AGENT_WALLET_TABLE} from './db/AgentWalletTable'
import communityTable from './db/CommunityTable'

function plentyInit () {
  console.log('Initializing Plenty')
  console.log('DB Mode', DB_MODE)
  console.log('DB Name', process.env.DB_NAME)

  const d = nSQL()
  console.log('DB obj', d)
  const c = d.connect()
  console.log('DB con', c)
  c.then(() => console.log('NSQL connected'))

  window.nsql = nSQL
}

function plentyInitSync (agentId, communityId, cb) {
  if (agentId && communityId) {
    console.log('PLETY INTI SYNC')
    setCurrentAgentId(agentId)
    setCurrentCommunityId(communityId)
    cb()

    nSQL().config({cache: false}).onConnected(() => {
      console.log('DB connected (sync init)')
      // startSync(['http://localhost:3000'])
    })
  }
}

export function onChannelView (agentId: string, channelId: string, communityId: string) {
  setCurrentAgentId(agentId)
  setCurrentCommunityId(communityId)
  // plentyInit()

  return nSQL().onConnected(async () => {
    console.log('DB connected (onConnected)')
    console.log('Community table', communityTable.getConfig())

    // await nSQL(AGENT_WALLET_TABLE).query('select').exec().then(all => {
    //   console.log('connected all wallets', all)
    // })
    // await nSQL('AgentWallet').query('select').where([['agentId', '=', '6oog8o5f4inj5d47terzjttyqa'], 'AND', ['communityId', '=', 'mqpni5abyjr69boge5om4t3fbc']])
    //   .exec().then(q => console.log('strings wallet', q))
    //
    await nSQL(AGENT_WALLET_TABLE).query('select')
      .where(['communityId', '=', communityId]).exec().then(r => {
        console.log('any community wallet', r)
      })
    await nSQL(AGENT_WALLET_TABLE).query('select')
      .where(['agentId', '=', agentId]).exec().then(r => {
        console.log('any agent wallet', r)
      })
    await nSQL(AGENT_WALLET_TABLE).query('select')
      .where([['agentId', '=', agentId], 'AND', ['communityId', '=', communityId]]).exec().then(r => {
        console.log('specific wallet', r)
      })

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
  sendMessage, hasEnoughFundsToSendMessage,
  nSQL,
  plentyInit, plentyInitSync
}
