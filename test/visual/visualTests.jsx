import React from 'react'
import ReactDOM from 'react-dom'
import {AccountStatus, MessageRating, NotEnoughFundsForMessageModal} from '../../src/index'
import {nSQL} from 'nano-sql'
import './visualTests.css'
import {currentCommunityId, getCurrentAgentId} from '../../src/state/GlobalState'
import {addCommunitySharePoints, setBalance} from '../../src/db/AgentWalletTable'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {initializeCommunity} from '../../src/accounting/Accounting'
import {setCommunityBalance} from '../../src/db/CommunityTable'

nSQL().onConnected(async () => {
  await addAgentToCommunity(getCurrentAgentId(), currentCommunityId)
  const success = await initializeCommunity(currentCommunityId)

  console.log('Initialized community', success)

  await setCommunityBalance(currentCommunityId, 10)
  // await setBalance(getCurrentAgentId(), currentCommunityId, 20)
  await setBalance(getCurrentAgentId(), currentCommunityId, -1)
  // await addCommunitySharePoints(getCurrentAgentId(), currentCommunityId, 1)

  let b = 1
  setInterval(() => {
    setBalance(getCurrentAgentId(), currentCommunityId, (b += 1))
    setCommunityBalance(currentCommunityId, b += 1)
  }, 3000)

  function ComponentDisplay () {
    console.log('Test Component Display rendering')
    return <div className={'tests-container'}>
      <div><AccountStatus agentId={getCurrentAgentId()} communityId={currentCommunityId}/></div>
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
