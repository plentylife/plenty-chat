import React, {Component} from 'react'
import {getWallet} from '../../db/AgentWalletTable'
import type {Wallet} from '../../db/AgentWalletTable'
import './style.css'
import {bindNSQL} from 'nano-sql-react/index'
import Balance from './Balance'
import {AGENT_WALLET_TABLE} from '../../db/tableNames'
import {calculateDemurrageRate} from '../../accounting/Demurrage'
import {Decimal} from 'decimal.js'
import {BALANCE_INTRO, CREDIT_LIMIT_INTRO, DEMURRAGE_INTRO} from '../Tutorial'
import {registerReadyForTutorial} from '../ControlPanel/ControlPanel'

type Props = {
  agentId: string,
  communityId: string,
  nSQLdata: Wallet
}

class AgentBalance extends Component<Props> {
  static tables () {
    return [AGENT_WALLET_TABLE] // listen for changes on this table
  }

  static onChange (event: any, complete: any => void) {
    let q = getWallet(this.props.agentId, this.props.communityId)

    q.then((wallet) => {
      // console.log('AccountStatus component. Agent, community, wallet, event',
      //   this.props.agentId, this.props.communityId, wallet, event)
      complete(wallet)
    })

    // fixme optimize at some point to react only to the appropriate change
  }

  shouldComponentUpdate (nextProps, nextState) {
    return JSON.stringify(this.props.nSQLdata) !== JSON.stringify(nextProps.nSQLdata)
  }

  static Unavailable () {
    return <div className="unavailable">Wallet info unavailable</div>
  }
  componentDidUpdate () {
    if (this.props.nSQLdata) registerReadyForTutorial('account')
  }

  componentDidMount () {
    if (this.props.nSQLdata) registerReadyForTutorial('account')
  }

  render () {
    const data = this.props.nSQLdata
    // $FlowFixMe
    const disp = () => {
      if (!data) {
        // eslint-disable-next-line no-unused-expressions
        return <AgentBalance.Unavailable/>
      } else {
        const drate = calculateDemurrageRate(data.incomingStat, data.outgoingStat)
        // eslint-disable-next-line no-unused-expressions
        return <span className={'agent-block'}>
          <span className={'balance-block'}>
            <span className={'agent-balance accounting-info'} data-step="2" data-intro={BALANCE_INTRO} data-position="top">
              <label>Balance</label><Balance amount={data.balance}/>
            </span>
            <span className={'demurrage info'} data-step="3" data-intro={DEMURRAGE_INTRO} data-position="top">
              Spoiling at {Decimal(1).minus(drate).times(100).trunc().toString()}% per day</span>
          </span>
          <span className={'accounting-info'} data-step="4" data-intro={CREDIT_LIMIT_INTRO} data-position="top">
            <label>Credit Limit</label><Balance amount={data.creditLimit}/></span>
        </span>
      }
    }

    return disp()
  }
}

const sql = bindNSQL(AgentBalance)
export default sql
