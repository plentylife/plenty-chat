// @flow
import React from 'react'
import AccountStatus from '../AccountStatus/AccountStatus'
import './controlPanel.scss'
import {DonationWindow} from '../DonateWindow'
import DonateModal from '../DonateWindow/DonateModal'

type Props = {
  agentId: string,
  communityId: string,
  getUserProfile: (string) => Object,
  getUserImage: (Object) => string
}

// const getUP = (agentid) => ({first_name: agentid, last_name: 'kats'})
// const getP = () => ('https://www.shareicon.net/data/128x128/2016/05/24/769971_man_512x512.png')

export default class ControlPanel extends React.Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      donateModalOpen: false
    }
    this.openDonateModal = this.openDonateModal.bind(this)
    this.hideDonateModal = this.hideDonateModal.bind(this)
  }

  openDonateModal () {
    this.setState({donateModalOpen: true})
  }

  hideDonateModal () {
    this.setState({donateModalOpen: false})
  }

  render () {
    const modal = this.state.donateModalOpen
      ? <DonateModal getUserProfile={this.props.getUserProfile}
        getUserImage={this.props.getUserImage}
        isOpen={this.state.donateModalOpen} onHide={this.hideDonateModal}
      /> : null
    return <div id={'plenty-control-panel'}>
      {modal}
      <DonationWindow getUserProfile={this.props.getUserProfile}
        getUserImage={this.props.getUserImage}
        onOpen={this.openDonateModal}/>
      <AccountStatus agentId={this.props.agentId} communityId={this.props.communityId}/>
    </div>
  }
}
