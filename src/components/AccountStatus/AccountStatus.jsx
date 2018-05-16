import React, {PureComponent} from 'react'
import './style.css'
import AgentBalance from './AgentBalance'
import CommunityBalance from './CommunityBalance'
import {ACCOUNT_INTRO} from '../Tutorial'

type Props = {
  agentId: string,
  communityId: string
}

class AccountStatus extends PureComponent<Props> {
  render () {
    return <span className={'account-status-block'} data-step="1" data-intro={ACCOUNT_INTRO} data-position="top">
      <AgentBalance {...this.props}/>
      <CommunityBalance {...this.props}/>
    </span>
  }
}

export default AccountStatus
