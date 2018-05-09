import React from 'react'
import {Modal} from 'react-bootstrap'
import AgentRow from './AgentRow'
import {getWalletsNearLimit} from '../../db/AgentWalletTable'
import DonationWindow from './DonationWindow'
import {getCurrentCommunityId} from '../../state/GlobalState'
import './donateStyle.scss'
import equals from 'shallow-equals'

type Props = {
  isOpen: boolean,
  onHide: () => void,
  getUserProfile: (string) => Object,
  getUserImage: (Object) => string,
  onSelect: (string, Object) => void
}

export default class DonateModal extends React.Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      wallets: []
    }
    DonateModal.getWallets().then(ws => this.setState({wallets: ws}))
  }

  componentDidUpdate () {
    if (this.props.isOpen) {
      DonateModal.getWallets().then(ws => this.setState({wallets: ws}))
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    const p = !equals(nextProps, this.props)
    let ws = !(this.state.wallets.length === nextState.wallets.length)
    for (let i = 0; this.state.wallets.length > i; i++) {
      if (this.state.wallets[i].agentId !== nextState.wallets[i].agentId) {
        ws = true
      }
    }
    return p || ws
  }

  // setWallets () {
  //
  // }

  static async getWallets () {
    // fixme 300 is just for testing
    const wallets = await getWalletsNearLimit(getCurrentCommunityId(), 300).then(ws => {
      return DonationWindow.sortWallets(ws)
    })
    return wallets
  }

  render () {
    return <Modal show={this.props.isOpen} keyboard={true} onHide={this.props.onHide}>
      <Modal.Header closeButton={true}>
        <Modal.Title>Donate</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <ul className={'donate-modal-list'}>
          {!this.state.wallets ? null : this.state.wallets.map(w => {
            return <li key={w.agentId}>
              <AgentRow agentId={w.agentId} getProfile={this.props.getUserProfile} getImage={this.props.getUserImage}
                plea={false} onSelect={this.props.onSelect}/>
            </li>
          })}
        </ul>
      </Modal.Body>
    </Modal>
  }
}
