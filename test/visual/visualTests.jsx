import React from 'react'
import ReactDOM from 'react-dom'
import {AccountStatus, Rating} from '../../src/index'
import {nSQL} from 'nano-sql'
import './visualTests.css'
import {currentAgentId, currentCommunityId} from '../../src/state/GlobalState'
import {setBalance} from '../../src/db/AgentWalletTable'

nSQL().onConnected(() => {
  setBalance(currentAgentId, currentCommunityId, 20)
})

nSQL().connect()

function onRating (index) {
  console.log('Selected rating index', index)
}

function ComponentDisplay () {
  console.log('Test Component Display rendering')
  return <div className={'tests-container'}>
    <div><AccountStatus agentId={currentAgentId} communityId={currentCommunityId}/></div>
    <div>
      Rating
      <Rating numStars={3} onRating={onRating}/>
    </div>
  </div>
}

ReactDOM.render(
  <ComponentDisplay/>,
  document.getElementById('root')
)
