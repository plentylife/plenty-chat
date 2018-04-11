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

function ComponentDisplay () {
  return <div className={'tests-container'}>
    <div><AccountStatus /></div>
    <div>
      Rating
      <Rating/>
    </div>
  </div>
}

ReactDOM.render(
  <ComponentDisplay/>,
  document.getElementById('root')
)
