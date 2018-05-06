// @flow
import React from 'react'
import AccountStatus from '../AccountStatus/AccountStatus'
import './controlPanel.scss'
import DonateWindow from '../DonateWindow/DonateWindow'

type Props = {
  agentId: string,
  communityId: string
}

export default function ControlPanel (props: Props) {
  return <div id={'plenty-control-panel'}>
    <DonateWindow/>
    <AccountStatus agentId={props.agentId} communityId={props.communityId}/>
  </div>
}
