import React from 'react'
import './donateStyle.scss'
import type {Wallet} from '../../db/AgentWalletTable'
import AgentRow from './AgentRow'
import {AGENT_WALLET_TABLE} from '../../db/tableNames'
import {getWalletsForDonation} from './index'

type Props = {
  getUserImage: (Object) => string,
  getUserProfile: (string) => Object,
  nSQLdata: Array<Wallet>,
  onOpen: () => void
}

export default class DonationWindow extends React.Component<Props> {
  static tables () {
    return [AGENT_WALLET_TABLE] // listen for changes on this table
  }

  static onChange (event, complete) {
    console.log('Donate window', event)
    // if (event.notes.includes('mount')) { // todo or a new wallet near exhaustion
    getWalletsForDonation().then(ws => {
      complete(ws)
    }) // fixme not going to change when community changes. gotta get redux
    // }
  }

  render () {
    let entry = null
    if (this.props.nSQLdata && this.props.nSQLdata.length > 0) {
      const w = this.props.nSQLdata[0]
      entry = <AgentRow key={w.agentId} agentId={w.agentId} getProfile = {this.props.getUserProfile} getImage={this.props.getUserImage}
        plea={true} onSelect={(agentId, e) => {}}/>
    }

    return !entry ? null : (
      <div id={'donate-window'} onClick={e => {
        e.preventDefault()
        this.props.onOpen()
      }}>
        {entry}
      </div>
    )
  }
}
