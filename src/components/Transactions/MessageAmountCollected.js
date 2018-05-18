import React from 'react'
import {MESSAGE_TABLE} from '../../db/tableNames'
import {bindNSQL} from 'nano-sql-react/index'
import {getMessage} from '../../db/MessageTable'
import Balance from '../AccountStatus/Balance'
import {EVENT_TABLE, getEvent} from '../../db/EventTable'
import {Event} from '../../events'

type Props = {messageId: string, nSQLdata: {rows: Array<Object>, table: string}, nSQLloading: boolean}

type TransactionInfo = {eventId: string, amount: number, agentId: string}

export class MessageAmountCollected extends React.Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      amount: 0,
      transactions: [],
      eventsToParse: []
    }
    getMessage(this.props.messageId).then(async msg => {
      if (msg) {
        const events = msg.relatedEvents && await Promise.all(msg.relatedEvents.map(e => {
          return getEvent(e)
        }))
        const transactions = await MessageAmountCollected.extractTransactionsInfo([], events || [])
        this.setState({amount: msg.fundsCollected, transactions})
      }
    })
  }
  static tables () {
    return [MESSAGE_TABLE, EVENT_TABLE]
  }

  static onChange (event, complete) {
    if (!event.notes.includes('mount')) {
      complete({table: event.table, rows: event.affectedRows})
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (nextProps.nSQLloading) return false

    const isChanged = nextState.amount !== this.state.amount || this.state.transactions.length !== nextState.transactions.length
    if (isChanged) return true

    if (nextProps.nSQLdata.table === MESSAGE_TABLE) {
      const self = nextProps.nSQLdata && nextProps.nSQLdata.rows.find(r => (r.id === this.props.messageId))
      return self.fundsCollected !== this.state.amount && !nextProps.nSQLloading
    } else if (nextProps.nSQLdata.table === EVENT_TABLE) {
      if (this.state.eventsToParse.length > 0) {
        let incomingIds = []
        if (nextProps.nSQLdata) incomingIds = nextProps.nSQLdata.rows.map(r => (r.globalEventId))
        const self = incomingIds.filter(i => (this.state.eventsToParse.includes(i)))
        return self.length > 0
      } else {
        return false
      }
    }
  }

  static extractTransactionsInfo (existing: Array<TransactionInfo>, toExtract: Array<Event>): Array<TransactionInfo> {
    const updated = [...existing]
    const checkAgainst = updated.map(e => (e.eventId))
    toExtract.map(async event => {
      if (!checkAgainst.includes(event.globalEventId)) {
        const agentId = event.senderId
        const amount = event.payload.amount
        updated.push({eventId: event.globalEventId, agent: agentId, amount})
      }
    })

    return updated
  }

  componentDidUpdate () {
    if (this.props.nSQLdata.table === MESSAGE_TABLE) {
      const self = this.props.nSQLdata && this.props.nSQLdata.rows.find(r => (r.id === this.props.messageId))
      const parsedIds = this.state.transactions.map(t => (t.eventId))
      const toParse = self.relatedEvents.filter(re => (!parsedIds.includes(re)))
      this.setState({amount: self.fundsCollected, eventsToParse: toParse})
    } else if (this.props.nSQLdata.table === EVENT_TABLE) {
      const toParse = this.props.nSQLdata.rows.filter(i => (this.state.eventsToParse.includes(i.globalEventId))) || []
      const toParseIds = toParse.map(p => (p.globalEventId))
      const leftToParse = this.state.eventsToParse.filter(p => (!toParseIds.includes(p)))

      const transactions = MessageAmountCollected.extractTransactionsInfo(this.state.transactions, toParse)
      this.setState({transactions, eventsToParse: leftToParse})
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
