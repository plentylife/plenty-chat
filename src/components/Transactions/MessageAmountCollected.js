import React from 'react'
import {MESSAGE_TABLE} from '../../db/tableNames'
import {bindNSQL} from 'nano-sql-react/index'
import type {MessageRow} from '../../db/MessageTable'
import {getMessage} from '../../db/MessageTable'
import Balance from '../AccountStatus/Balance'
import {getEvent} from '../../db/EventTable'
// import {getMessage} from '../../db/MessageTable'

type Props = {messageId: string, nSQLdata: Array<MessageRow>}

type TransactionInfo = {eventId: string, amount: number, agentId: string}

export class MessageAmountCollected extends React.Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      amount: 0,
      transactions: []
    }
    getMessage(this.props.messageId).then(async msg => {
      if (msg) {
        const transactions = await MessageAmountCollected.extractTransactionsInfo([], msg.relatedEvents || [])
        this.setState({amount: msg.fundsCollected, transactions})
      }
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
    // return !!self || (nextState.amount !== this.state.amount)
    const isSelf = !!self && !nextProps.nSQLloading
    const isChanged = nextState.amount !== this.state.amount || this.state.transactions.length !== nextState.transactions.length
    return isSelf || isChanged
  }

  static extractTransactionsInfo (existing: Array<TransactionInfo>, toExtract: Array<string>): Array<TransactionInfo> {
    const updated = [...existing]
    const checkAgainst = updated.map(e => (e.eventId))
    const ps = toExtract.map(async eventId => {
      if (!checkAgainst.includes(eventId)) {
        const eventInfo = await getEvent(eventId)
        if (eventInfo) {
          const agentId = eventInfo.senderId
          const amount = eventInfo.payload.amount
          updated.push({eventId, agent: agentId, amount})
        }
      }
    })

    return Promise.all(ps).then(() => updated)
  }

  componentDidUpdate () {
    const self = this.props.nSQLdata && this.props.nSQLdata.find(r => (r.id === this.props.messageId))
    if (self) {
      const amount = self.fundsCollected
      if (amount === this.state.amount) return
      MessageAmountCollected.extractTransactionsInfo(this.state.transactions, self.relatedEvents || []).then(
        transactions => {
          const nextState = {amount, transactions}
          this.setState(nextState)
        }
      )
    }
  }

  render () {
    // return (!this.state.amount) ? null : <div className={'message-collected'}>
    return <div className={'message-collected'}>
      <Balance amount={this.state.amount} spellThanks={true}/> earned
      {JSON.stringify(this.state.transactions)}
    </div>
  }
}

const macSql = bindNSQL(MessageAmountCollected)

export default macSql
