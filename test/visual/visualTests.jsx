import React from 'react'
import ReactDOM from 'react-dom'
// import {AccountStatus, MessageRating, NotEnoughFundsForMessageModal} from '../../src/index'
import {AccountStatus, MessageRating} from '../../src/index'
import {nSQL} from 'nano-sql'
import './visualTests.css'
import {getCurrentCommunityId, getCurrentAgentId, DB_MODE} from '../../src/state/GlobalState'
import {addCommunitySharePoints, AGENT_WALLET_TABLE, getWallet, setBalance} from '../../src/db/AgentWalletTable'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {initializeCommunity} from '../../src/accounting/Accounting'
import communityTable, {COMMUNITY_TABLE, getCommunityBalance, setCommunityBalance} from '../../src/db/CommunityTable'
import {sendMessage} from '../../src'
import {createChannel} from '../../src/actions/ChannelActions'
import {rateMessage} from '../../src/actions/RatingActions'
import * as Tutorial from 'Tutorial'
import {dropAll} from '../utils'

nSQL().onConnected(async () => {
  await dropAll()

  window.getBalance = () => {
    return getCommunityBalance(getCurrentCommunityId()).then(communityBalance => {
      console.log('balance', communityBalance)
      return communityBalance
    })
  }

  window.getWallet = () => {
    return getWallet(getCurrentAgentId(), getCurrentCommunityId()).then(w => console.log(w))
  }

  window.getWalletTable = () => {
    nSQL(AGENT_WALLET_TABLE).query('select').exec().then(t => console.log(t))
  }

  window.setBalance = () => {
    nSQL(COMMUNITY_TABLE).query('upsert', {communityId: 'commid', balance: 500}).exec().then(r => {
      console.log(r)
    })
  }

  const CH_ID = 'channelid'
  const MSG_ID = 'rating-test-msg'
  console.log('Visual tests. Db connected in mode', DB_MODE)
  console.log('Visual tests. Db config', nSQL().getConfig())
  console.log('Visual tests. Db comm_table config', COMMUNITY_TABLE, communityTable.getConfig())
  console.log('Visual tests.', getCurrentAgentId(), getCurrentCommunityId())

  const OTHER_AGENT_ID = 'oid'
  await addAgentToCommunity(getCurrentAgentId(), getCurrentCommunityId())
  await addAgentToCommunity(OTHER_AGENT_ID, getCurrentCommunityId())
  const success = await initializeCommunity(getCurrentCommunityId())

  console.log('Initialized community', success)

  await createChannel(getCurrentAgentId(), CH_ID, getCurrentCommunityId())
  await setCommunityBalance(getCurrentCommunityId(), 21.3)
  // await setBalance(getCurrentAgentId(), getCurrentCommunityId(), 20)
  await setBalance(getCurrentAgentId(), getCurrentCommunityId(), -4.1)
  await addCommunitySharePoints(getCurrentAgentId(), getCurrentCommunityId(), 1)
  await addCommunitySharePoints(OTHER_AGENT_ID, getCurrentCommunityId(), 2)

  await sendMessage(OTHER_AGENT_ID, CH_ID, MSG_ID)
  await rateMessage(MSG_ID, getCurrentAgentId(), 1, 3)

  // let b = 1
  // setInterval(() => {
  //   setBalance(getCurrentAgentId(), getCurrentCommunityId(), (b += 1))
  //   setCommunityBalance(getCurrentCommunityId(), b += 1)
  // }, 3000)

  await nSQL(AGENT_WALLET_TABLE).query('select').exec().then(all => {
    console.log('connected all wallets', all)
  })

  await nSQL(AGENT_WALLET_TABLE).query('select')
    .where([['agentId', '=', getCurrentAgentId()], 'AND', ['communityId', '=', getCurrentCommunityId()]]).exec().then(r => {
      console.log('specific wallet (query)', r)
    })

  await getWallet(getCurrentAgentId(), getCurrentCommunityId()).then(w => {
    console.log('specific wallet', w)
  })

  function ComponentDisplay () {
    console.log('Test Component Display rendering')
    return <div className={'tests-container'}>
      <div><AccountStatus agentId={getCurrentAgentId()} communityId={getCurrentCommunityId()}/></div>
      <div onClick={() => {
        sendMessage(getCurrentAgentId(), CH_ID, new Date().getTime() + 'msg')
      }}>
        <button>SEND</button>
      </div>
      <div>
        Rating
        <MessageRating agentId={getCurrentAgentId()} messageId={MSG_ID}/>
      </div>
      <div>
      </div>
      <div className={'tutorial-screens'}>
        <Tutorial.ScreenOne/>
        <Tutorial.ScreenTwo/>
        <Tutorial.ScreenThree/>
        <Tutorial.ScreenFour/>
        <Tutorial.ScreenFive/>
        <Tutorial.ScreenTasks/>
        <Tutorial.ScreenCaveat/>
      </div>
    </div>
  }

  ReactDOM.render(
    <ComponentDisplay/>,
    document.getElementById('root')
  )
})

const c = nSQL().config({mode: DB_MODE, cache: false}).connect()
console.log('DB con promise', c)

// <NotEnoughFundsForMessageModal show={true} onClose={() => null}/>
