import React, {Component} from 'react'
import type {Wallet} from '../../db/AgentWalletTable'
import './style.css'
import {COMMUNITY_TABLE, getCommunityBalance} from '../../db/CommunityTable'
import {calculateCommunityPotSplit} from '../../accounting/CommunityPot'
import {bindNSQL} from 'nano-sql-react/index'
import {AGENT_WALLET_TABLE} from '../../db/AgentWalletTable'
import Balance from './Balance'
import {CRON_TIME} from '../../state/GlobalState'
import {nSQL} from 'nano-sql/lib/index'

type Props = {
  agentId: string,
  communityId: string,
  nSQLdata: Wallet // todo. wrong
}

class CommunityBalance extends Component<Props> {
  static tables () {
    return [COMMUNITY_TABLE, AGENT_WALLET_TABLE] // listen for changes on this table
  }

  static onChange (event: any, complete: any => void) {
    console.log('Community balance event', event)
    nSQL(COMMUNITY_TABLE).query('select').where(['communityId', '=', this.props.communityId]).exec().then(r => {
      console.log('onChange com balance', r)
      return r.length > 0 ? r[0].balance : 0
    })

    return getCommunityBalance(this.props.communityId).then(communityBalance => {
      console.log('Community balance', this.props.communityId, communityBalance)
      // console.log('Community balance', this.props.communityId, communityBalance, share, shares)
      calculateCommunityPotSplit(this.props.communityId, communityBalance).then(shares => {
        let share = shares.find(s => (s.agentId === this.props.agentId))
        if (share) {
          share = share.amount
        } else {
          share = '- '
        }

        complete({communityBalance, share})
      })
    })
  }

  shouldComponentUpdate (nextProps, nextState) {
    return true
    // return JSON.stringify(this.props.nSQLdata) !== JSON.stringify(nextProps.nSQLdata)
  }

  static Unavailable () {
    return <div className="unavailable">Community info unavailable</div>
  }

  render () {
    setTimeout(() => {
      getCommunityBalance(this.props.communityId).then(communityBalance => {
        console.log('comm render timeout balance', communityBalance)
      })
    }, 3000)

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
          <span className={'community-share-block'}>
            <span className={'accounting-info'}><label>Your share</label><Balance amount={data.share}/></span>
            <span className={'info'}>Distributed every {CRON_TIME} minutes</span>
          </span>
        </span>
      }
    }

    return disp()
  }
}

const sql = bindNSQL(CommunityBalance)
export default sql
