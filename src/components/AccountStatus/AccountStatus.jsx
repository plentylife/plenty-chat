import React, {PureComponent} from 'react'
import {getBalanceById} from '../../db/UserTable'

// import {nSQL} from 'nano-sql'

class AccountStatus extends PureComponent {
  static tables () {
    return ['balance'] // listen for changes on this table
  }

  static onChange (event, complete) {
    console.log('account status changed event', event)

    if (!event.notes.includes('mount')) {
      complete(event.affectedRows[0].balance)
    } else {
      getBalanceById(this.props.userId)
    }
  }

  render () {
    return <div>
            Account balance {this.props.nSQLdata}
    </div>
  }
}

export default AccountStatus
