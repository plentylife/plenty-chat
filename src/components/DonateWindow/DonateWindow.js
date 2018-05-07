import React from 'react'
import './donateWindow.scss'
import {AGENT_WALLET_TABLE, getWalletsNearLimit} from '../../db/AgentWalletTable'
import {getCurrentCommunityId} from '../../state/GlobalState'
import type {Wallet} from '../../db/AgentWalletTable'
import {getLastEventBy} from '../../db/EventTable'

type Props = {}

export default class DonateWindow extends React.Component<Props> {
  static tables () {
    return [AGENT_WALLET_TABLE] // listen for changes on this table
  }

  static onChange (event, complete) {
    console.log('Donate vindow', event)
    if (event.notes.includes('mount')) { // or a new wallet near exhaustion
      getWalletsNearLimit(getCurrentCommunityId(), 300).then(async ws => {
        const sorted = await DonateWindow.sortWallets(ws)
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
    return <div id={'donate-window'}>
      {this.props.nSQLdata && this.props.nSQLdata.map((w: Wallet) => {
        return <div key={w.agentId}>
          {w.agentId}
        </div>
      })}
    </div>
  }
}
