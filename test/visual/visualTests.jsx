import React from 'react'
import ReactDOM from 'react-dom'
import {AccountStatus, Rating} from '../../src/index'
import {nSQL} from 'nano-sql'
import agentTable, {AGENT_TABLE} from '../../src/db/AgentTable'
import './visualTests.css'
import {currentAgentId} from '../../src/state/GlobalState'

agentTable.onConnected(() => {
  console.log('connected to agentTable')
  return nSQL(AGENT_TABLE).query('upsert', {
    agentId: 'anton', balance: 20
  }).exec()
})

nSQL().connect()

function onRating (index) {
  console.log('Selected rating index', index)
}

function ComponentDisplay () {
  console.log('Test Component Display rendering')
  return <div className={'tests-container'}>
    <div><AccountStatus agentId={currentAgentId}/></div>
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
