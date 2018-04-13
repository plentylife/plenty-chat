import React, {PureComponent} from 'react'
import {AGENT_WALLET_TABLE, getBalance} from '../../db/AgentWalletTable'
import type {Wallet} from '../../db/AgentWalletTable'
import './style.css'
import {TENGE} from '../utils'

type Props = {
  agentId: string,
  communityId: string,
  nSQLdata: Wallet
}

class AccountStatus extends PureComponent<Props> {
  static tables () {
    return [AGENT_WALLET_TABLE] // listen for changes on this table
  }

  static onChange (event: any, complete: any => void) {
    let q = getBalance(this.props.agentId, this.props.communityId)

    q.then((wallet) => {
      console.log('AccountStatus component. Agent, community, wallet, event',
        this.props.agentId, this.props.communityId, wallet, event)
      complete(wallet)
    })

    // fixme optimize at some point to react only to the appropriate change
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
        return <AccountStatus.Unavailable/>
      } else {
        // eslint-disable-next-line no-unused-expressions
        return <span className={'agent-balance'}>
          <span><label>Balance</label><span>{data.balance}{TENGE}</span></span>
          <span><label>Credit Limit</label><span>{data.creditLimit}{TENGE}</span></span>
        </span>
      }
    }

    return <div className={'wallet-container'}>
      {
        disp()
      }
    </div>
  }
}

export default AccountStatus
