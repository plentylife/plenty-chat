import React, {PureComponent} from 'react'
import {getBalanceById, AGENT_TABLE} from '../../db/AgentTable'

class AccountStatus extends PureComponent {
  static tables () {
    return [AGENT_TABLE] // listen for changes on this table
  }

  static onChange (event, complete) {
    console.log('account status changed event', event)

    let q = getBalanceById(this.props.agentId)

    q.then((rows) => {
      console.log('account status query result', rows, 'for', this.props.agentId)
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
