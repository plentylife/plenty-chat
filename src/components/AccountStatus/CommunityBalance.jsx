import React, {PureComponent} from 'react'
import type {Wallet} from '../../db/AgentWalletTable'
import './style.css'
import {COMMUNITY_TABLE, getCommunityBalance} from '../../db/CommunityTable'
import {calculateCommunityPotSplit} from '../../accounting/CommunityPot'
import {bindNSQL} from 'nano-sql-react/index'
import {AGENT_WALLET_TABLE} from '../../db/AgentWalletTable'
import Balance from './Balance'

type Props = {
  agentId: string,
  communityId: string,
  nSQLdata: Wallet
}

class CommunityBalance extends PureComponent<Props> {
  static tables () {
    return [COMMUNITY_TABLE, AGENT_WALLET_TABLE] // listen for changes on this table
  }

  static onChange (event: any, complete: any => void) {
    return getCommunityBalance(this.props.communityId).then(communityBalance => {
      calculateCommunityPotSplit(this.props.communityId, communityBalance).then(shares => {
        let share = shares.find(s => (s.agentId === this.props.agentId))
        if (share) share = share.amount

        console.log('Community balance', this.props.communityId, communityBalance, share, shares)
        complete({communityBalance, share})
      })
    })
  }

  static Unavailable () {
    return <div className="unavailable">Community info unavailable</div>
  }

  render () {
    const data = this.props.nSQLdata
    // $FlowFixMe
    const disp = () => {
      if (!data) {
        // eslint-disable-next-line no-unused-expressions
        return <CommunityBalance.Unavailable/>
      } else {
        // eslint-disable-next-line no-unused-expressions
        return <span className={'community-block'}>
          <span className={'accounting-info'}><label>Community pot</label><Balance amount={data.communityBalance}/></span>
          <span className={'accounting-info'}><label>Your share</label><Balance amount={data.share}/></span>
        </span>
      }
    }

    return disp()
  }
}

const sql = bindNSQL(CommunityBalance)
export default sql
