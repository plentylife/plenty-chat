import React, {PureComponent} from 'react'

// import {nSQL} from 'nano-sql'

class AccountStatus extends PureComponent {
  static tables () {
    return ['balance'] // listen for changes on this table
  }

  static onChange (event, complete) {
    console.log('account status changed event', event)

    complete(new Date().getTime())
  }

  render () {
    return <div>
            Account balance {this.props.nSQLdata}
    </div>
  }
}

export default AccountStatus
