import React from 'react'
import './donateWindow.scss'
import {AGENT_WALLET_TABLE, getWalletsNearLimit} from '../../db/AgentWalletTable'
import {getCurrentCommunityId} from '../../state/GlobalState'
import type {Wallet} from '../../db/AgentWalletTable'

type Props = {}

export default class DonateWindow extends React.Component<Props> {
  static tables () {
    return [AGENT_WALLET_TABLE] // listen for changes on this table
  }

  static onChange (event, complete) {
    console.log('Donate vindow', event)
    if (event.notes.includes('mount')) {
      getWalletsNearLimit(getCurrentCommunityId(), 300).then(complete) // fixme not going to change when community changes. gotta get redux
    } else {

    }
  }

  render () {
    return <div id={'donate-window'}>
      {this.props.nSQLdata && this.props.nSQLdata.map((w: Wallet) => {
        return <div key={w.agentId}>
          {JSON.stringify(w)}
        </div>
      })}
    </div>
  }
}
