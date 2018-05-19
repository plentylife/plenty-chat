import React from 'react'
import {MESSAGE_TABLE} from '../../db/tableNames'
import {bindNSQL} from 'nano-sql-react/index'
import {getMessage} from '../../db/MessageTable'
import Balance from '../AccountStatus/Balance'
import {EVENT_TABLE, getEvent} from '../../db/EventTable'
import {Event} from '../../events'
import {mmImageGetter, mmUserGetter} from '../../mmintegration'
import {userNameFromProfile} from '../utils'
import './messageAmountCollected.scss'
import {Well} from 'react-bootstrap'

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
        const eventsToParse = []
        let events = msg.relatedEvents && await Promise.all(msg.relatedEvents.map(async e => {
          const event = await getEvent(e)
          if (!event) eventsToParse.push(e)
          return event
        }))
        events = events.filter(e => (e !== null))
        const transactions = await MessageAmountCollected.extractTransactionsInfo([], events || [])
        this.setState({amount: msg.fundsCollected, transactions, eventsToParse})
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
    const isChanged = nextState.amount !== this.state.amount || this.state.transactions.length !== nextState.transactions.length
    if (isChanged) return true

    if (nextProps.nSQLloading) return false

    if (nextProps.nSQLdata.table === MESSAGE_TABLE) {
      const self = nextProps.nSQLdata && nextProps.nSQLdata.rows.find(r => (r.id === this.props.messageId))
      return !!self && self.fundsCollected !== this.state.amount && !nextProps.nSQLloading
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
        updated.push({eventId: event.globalEventId, agentId, amount})
      }
    })

    return updated
  }

  componentDidUpdate () {
    if (this.props.nSQLdata) {
      if (this.props.nSQLdata.table === MESSAGE_TABLE) {
        const self = this.props.nSQLdata.rows.find(r => (r.id === this.props.messageId))
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
  }

  static renderAgentContribution (agentId: string, amount: number, isLast: boolean, index: number) {
    const profile = mmUserGetter(agentId)
    const image = mmImageGetter(profile)

    return <div className={'message-contribution'} key={index}>
      <span className={'avatar'}>
        <img src={image}/>
      </span>
      <span className={'agent-name'}>
        {userNameFromProfile(profile)}
      </span>
      <span className={'gave-word'}>gave</span>
      <Balance amount={amount}/>
      {!isLast ? ',' : null}
    </div>
  }

  render () {
    return (!this.state.amount) ? null : <div className={'message-collected'}>
      <Well bsSize={'small'}>
        <Balance amount={this.state.amount} spellThanks={true}/> earned:
        {this.state.transactions.map((t, i) => {
          const isLast = (this.state.transactions.length - 1 - i) === 0
          return (MessageAmountCollected.renderAgentContribution(t.agentId, t.amount, isLast, i))
        })}
      </Well>
    </div>
  }
}

const macSql = bindNSQL(MessageAmountCollected)

export default macSql
