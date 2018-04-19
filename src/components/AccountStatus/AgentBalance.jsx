import React, {Component} from 'react'
import {AGENT_WALLET_TABLE, getWallet} from '../../db/AgentWalletTable'
import type {Wallet} from '../../db/AgentWalletTable'
import './style.css'
import {DEFAULT_DEMURRAGE_RATE} from '../../accounting/AccountingGlobals'
import {bindNSQL} from 'nano-sql-react/index'
import Balance from './Balance'

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

  render () {
    const data = this.props.nSQLdata
    // $FlowFixMe
    const disp = () => {
      if (!data) {
        // eslint-disable-next-line no-unused-expressions
        return <AgentBalance.Unavailable/>
      } else {
        // eslint-disable-next-line no-unused-expressions
        return <span className={'agent-block'}>
          <span className={'balance-block'}>
            <span className={'agent-balance accounting-info'}><label>Balance</label><Balance amount={data.balance}/></span>
            <span className={'demurrage info'}>Spoiling at ${Math.trunc(DEFAULT_DEMURRAGE_RATE * 100)}% per day</span>
          </span>
          <span className={'accounting-info'}><label>Credit Limit</label><Balance amount={data.creditLimit}/></span>
        </span>
      }
    }

    return disp()
  }
}

const sql = bindNSQL(AgentBalance)
export default sql
