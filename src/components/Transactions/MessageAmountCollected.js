import React from 'react'
import {MESSAGE_TABLE} from '../../db/tableNames'
import {bindNSQL} from 'nano-sql-react/index'
import type {MessageRow} from '../../db/MessageTable'
import {getMessage} from '../../db/MessageTable'
import Balance from '../AccountStatus/Balance'
// import {getMessage} from '../../db/MessageTable'

type Props = {messageId: string, nSQLdata: Array<MessageRow>}

export class MessageAmountCollected extends React.Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      amount: 0
    }
    getMessage(this.props.messageId).then(msg => {
      msg && this.setState({amount: msg.fundsCollected})
    })
  }
  static tables () {
    return [MESSAGE_TABLE]
  }

  static onChange (event, complete) {
    if (!event.notes.includes('mount')) {
      complete(event.affectedRows)
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    const self = nextProps.nSQLdata && nextProps.nSQLdata.find(r => (r.id === this.props.messageId))
    return !!self || (nextState.amount !== this.state.amount)
  }

  render () {
    const self = this.props.nSQLdata && this.props.nSQLdata.find(r => (r.id === this.props.messageId))
    let amount = (self && self.fundsCollected) || this.state.amount
    return (!amount) ? null : <div className={'message-collected'}>
      <Balance amount={amount} spellThanks={true}/> earned
    </div>
  }
}

const macSql = bindNSQL(MessageAmountCollected)

export default macSql
