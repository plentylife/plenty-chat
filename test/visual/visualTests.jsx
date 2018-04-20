import React from 'react'
import ReactDOM from 'react-dom'
import {AccountStatus, MessageRating, NotEnoughFundsForMessageModal} from '../../src/index'
import {nSQL} from 'nano-sql'
import './visualTests.css'
import {getCurrentCommunityId, getCurrentAgentId, DB_MODE} from '../../src/state/GlobalState'
import {addCommunitySharePoints, AGENT_WALLET_TABLE, getWallet, setBalance} from '../../src/db/AgentWalletTable'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {initializeCommunity} from '../../src/accounting/Accounting'
import {setCommunityBalance} from '../../src/db/CommunityTable'
import {sendMessage} from '../../src'
import {createChannel} from '../../src/actions/ChannelActions'

nSQL().onConnected(async () => {
  const CH_ID = 'channelid'
  console.log('Visual tests. Db connected in mode', DB_MODE)

  const OTHER_AGENT_ID = 'oid'
  await addAgentToCommunity(getCurrentAgentId(), getCurrentCommunityId())
  await addAgentToCommunity(OTHER_AGENT_ID, getCurrentCommunityId())
  const success = await initializeCommunity(getCurrentCommunityId())

  console.log('Initialized community', success)

  await createChannel(getCurrentAgentId(), CH_ID, getCurrentCommunityId())
  await setCommunityBalance(getCurrentCommunityId(), 10)
  // await setBalance(getCurrentAgentId(), getCurrentCommunityId(), 20)
  await setBalance(getCurrentAgentId(), getCurrentCommunityId(), -1)
  await addCommunitySharePoints(getCurrentAgentId(), getCurrentCommunityId(), 1)
  await addCommunitySharePoints(OTHER_AGENT_ID, getCurrentCommunityId(), 2)

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
        <MessageRating/>
      </div>
      <div>
        <NotEnoughFundsForMessageModal show={true} onClose={() => null}/>
      </div>
    </div>
  }

  ReactDOM.render(
    <ComponentDisplay/>,
    document.getElementById('root')
  )
})

nSQL().connect()

// function onRating (index) {
//   console.log('Selected rating index', index)
// }
