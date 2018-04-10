import React, {PureComponent} from 'react'

// import {nSQL} from 'nano-sql'

class AccountStatus extends PureComponent {
  static tables () {
    return ['balance'] // listen for changes on this table
  }

  static onChange (event, complete) {
    console.log('account status changed event', event)

    // if (event.affectedRows && event.affectedRows.length > 0) {
    if (!event.notes.includes('mount')) {
      complete(event.affectedRows[0].balance)
    }
  }

  render () {
    return <div>
            Account balance {this.props.nSQLdata}
    </div>
  }
}

export default AccountStatus
