import React from 'react'
import ReactDOM from 'react-dom'
import {AccountStatus, Rating} from '../src/index'
import {nSQL} from 'nano-sql'
import BalanceTable from '../src/db/UserTable'
import './visualTests.css'

BalanceTable.onConnected((res) => {
  return nSQL().query('upsert', {
    userId: 'anton', balance: 20
  }).exec()
})

function onRating (index) {
  console.log('Selected rating index', index)
}

function ComponentDisplay () {
  return <div className={'tests-container'}>
    <div><AccountStatus /></div>
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
