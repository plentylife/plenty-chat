import React from 'react'
import './donateStyle.scss'
import {AGENT_WALLET_TABLE, getWalletsNearLimit} from '../../db/AgentWalletTable'
import {getCurrentCommunityId} from '../../state/GlobalState'
import type {Wallet} from '../../db/AgentWalletTable'
import {getLastEventBy} from '../../db/EventTable'
import AgentRow from './AgentRow'

type Props = {
  getUserImage: (Object) => string,
  getUserProfile: (string) => Object
}

export default class DonationWindow extends React.Component<Props> {
  static tables () {
    return [AGENT_WALLET_TABLE] // listen for changes on this table
  }

  static onChange (event, complete) {
    console.log('Donate vindow', event)
    if (event.notes.includes('mount')) { // todo or a new wallet near exhaustion
      getWalletsNearLimit(getCurrentCommunityId(), 300).then(async ws => {
        const sorted = await DonationWindow.sortWallets(ws)
        complete(sorted)
      }) // fixme not going to change when community changes. gotta get redux
    }
  }

  static async sortWallets (wallets: Array<Wallet>): Promise<Array<Wallet>> {
    const withLastTimestamp = []
    const ps = wallets.map(w => {
      return getLastEventBy(w.agentId, w.communityId).then(e => {
        withLastTimestamp.push([e.timestamp, w])
      })
    })
    await Promise.all(ps)
    return withLastTimestamp.sort((a, b) => {
      return b[0] - a[0]
    }).map(wt => (wt[1]))
  }

  render () {
    let entry = null
    if (this.props.nSQLdata && this.props.nSQLdata.length > 0) {
      const w = this.props.nSQLdata[0]
      entry = <AgentRow key={w.agentId} agentId={w.agentId} getProfile = {this.props.getUserProfile} getImage={this.props.getUserImage}
        plea={true}/>
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
