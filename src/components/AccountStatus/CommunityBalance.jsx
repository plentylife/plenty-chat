import React, {Component} from 'react'
import type {Wallet} from '../../db/AgentWalletTable'
import './style.css'
import {COMMUNITY_TABLE, getCommunityBalance} from '../../db/CommunityTable'
import {calculateCommunityPotSplit} from '../../accounting/CommunityPot'
import {bindNSQL} from 'nano-sql-react/index'
import {AGENT_WALLET_TABLE} from '../../db/tableNames'
import Balance from './Balance'
import {CRON_TIME} from '../../state/GlobalState'
import {COMMUNITY_BALANCE_INTRO, SHARE_INTRO} from '../Tutorial'
import {registerReadyForTutorial} from '../ControlPanel/ControlPanel'

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

  componentDidUpdate () {
    if (this.props.nSQLdata) registerReadyForTutorial('community')
  }

  componentDidMount () {
    if (this.props.nSQLdata) registerReadyForTutorial('community')
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
          <span className={'accounting-info'} data-step="5" data-intro={COMMUNITY_BALANCE_INTRO} data-position="top">
            <label>Community pot</label><Balance amount={data.communityBalance}/></span>
          <span className={'community-share-block'}>
            <span className={'accounting-info'} data-step="6" data-intro={SHARE_INTRO} data-position="top">
              <label>Your share</label><Balance amount={data.share}/></span>
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
