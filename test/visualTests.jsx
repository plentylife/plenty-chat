import React from 'react'
import ReactDOM from 'react-dom'
import {AccountStatus} from '../src/index'
import {nSQL} from 'nano-sql'
import BalanceTable from '../src/db/balanceTable'

BalanceTable.onConnected((res) => {
  return nSQL().query('upsert', {
    userId: 'anton', balance: 20
  }).exec()
})

ReactDOM.render(
  <AccountStatus />,
  document.getElementById('root')
)
