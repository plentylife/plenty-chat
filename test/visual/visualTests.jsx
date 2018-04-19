import React from 'react'
import ReactDOM from 'react-dom'
import {AccountStatus, MessageRating, NotEnoughFundsForMessageModal} from '../../src/index'
import {nSQL} from 'nano-sql'
import './visualTests.css'
import {getCurrentCommunityId, getCurrentAgentId} from '../../src/state/GlobalState'
import {addCommunitySharePoints, setBalance} from '../../src/db/AgentWalletTable'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {initializeCommunity} from '../../src/accounting/Accounting'
import {setCommunityBalance} from '../../src/db/CommunityTable'

nSQL().onConnected(async () => {
  console.log('Visual tests. Db connected')

  const OTHER_AGENT_ID = 'oid'
  await addAgentToCommunity(getCurrentAgentId(), getCurrentCommunityId())
  await addAgentToCommunity(OTHER_AGENT_ID, getCurrentCommunityId())
  const success = await initializeCommunity(getCurrentCommunityId())

  console.log('Initialized community', success)

  await setCommunityBalance(getCurrentCommunityId(), 10)
  // await setBalance(getCurrentAgentId(), getCurrentCommunityId(), 20)
  await setBalance(getCurrentAgentId(), getCurrentCommunityId(), -1)
  await addCommunitySharePoints(getCurrentAgentId(), getCurrentCommunityId(), 1)
  await addCommunitySharePoints(OTHER_AGENT_ID, getCurrentCommunityId(), 2)

  let b = 1
  setInterval(() => {
    setBalance(getCurrentAgentId(), getCurrentCommunityId(), (b += 1))
    setCommunityBalance(getCurrentCommunityId(), b += 1)
  }, 3000)

  function ComponentDisplay () {
    console.log('Test Component Display rendering')
    return <div className={'tests-container'}>
      <div><AccountStatus agentId={getCurrentAgentId()} communityId={getCurrentCommunityId()}/></div>
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
