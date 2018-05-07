import React from 'react'
import {Modal} from 'react-bootstrap'
import AgentRow from './AgentRow'
import {getWalletsNearLimit} from '../../db/AgentWalletTable'
import DonationWindow from './DonationWindow'
import {getCurrentCommunityId} from '../../state/GlobalState'
import './donateStyle.scss'

export default class DonateModal extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      wallets: []
    }
    DonateModal.getWallets().then(ws => this.setState({wallets: ws}))
  }

  componentDidUpdate () {
    DonateModal.getWallets().then(ws => this.setState({wallets: ws}))
  }

  static async getWallets () {
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
                plea={false}/>
            </li>
          })}
        </ul>
      </Modal.Body>
    </Modal>
  }
}
