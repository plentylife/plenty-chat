import React from 'react'
import ReactDOM from 'react-dom'
import {AccountStatus, Rating} from '../src/index'
import {nSQL} from 'nano-sql'
import userTable, {USER_TABLE} from '../src/db/UserTable'
import './visualTests.css'
import {currentUser} from '../src/state/GlobalState'

userTable.onConnected(() => {
  console.log('connected to userTable')
  return nSQL(USER_TABLE).query('upsert', {
    userId: 'anton', balance: 20
  }).exec()
})

nSQL().connect()

function onRating (index) {
  console.log('Selected rating index', index)
}

function ComponentDisplay () {
  console.log('Test Component Display rendering')
  return <div className={'tests-container'}>
    <div><AccountStatus userId={currentUser}/></div>
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
