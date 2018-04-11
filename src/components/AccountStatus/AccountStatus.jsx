import React, {PureComponent} from 'react'
import {getBalanceById, USER_TABLE} from '../../db/UserTable'

class AccountStatus extends PureComponent {
  static tables () {
    return [USER_TABLE] // listen for changes on this table
  }

  static onChange (event, complete) {
    console.log('account status changed event', event)

    let q = getBalanceById(this.props.userId)

    q.then((rows) => {
      console.log('account status query result', rows, 'for', this.props.userId)
      complete(rows.length > 0 ? rows[0].balance : null)
    })

    // fixme optimize at some point
    // if (!event.notes.includes('mount')) {
    //   complete(event.affectedRows[0].balance)
    // } else {
    // }
  }

  static Unavailable () {
    return <div className="unavailable">Unavailable</div>
  }

  render () {
    console.log("render", this.props.nSQLdata)
    return <div>
            Account balance {
        this.props.nSQLdata ? this.props.nSQLdata : <AccountStatus.Unavailable/>
      }
    </div>
  }
}

export default AccountStatus
