import React, {PureComponent} from 'react'
import './style.css'
import AgentBalance from './AgentBalance'
import CommunityBalance from './CommunityBalance'

type Props = {
  agentId: string,
  communityId: string
}

class AccountStatus extends PureComponent<Props> {
  render () {
    return <span className={'account-status-block'} data-step="1" data-intro="This is a tooltip!" data-position="top">
      <AgentBalance {...this.props}/>
      <CommunityBalance {...this.props}/>
    </span>
  }
}

export default AccountStatus
