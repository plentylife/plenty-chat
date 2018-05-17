// @flow
import React from 'react'
import AccountStatus from '../AccountStatus/AccountStatus'
import './controlPanel.scss'
import {DonationWindow} from '../DonateWindow'
import DonateModal from '../DonateWindow/DonateModal'
import TransactionAmountModal from '../Transactions/TransactionAmountModal'
import {userNameFromProfile} from '../utils'
import {convertStringToValidAmount} from '../../accounting/Accounting'
import {makeTransaction} from '../../actions/AccountingActions'
import {getCurrentAgentId, getCurrentCommunityId} from '../../state/GlobalState'
import {startMainIntro} from '../Tutorial'

type Props = {
  agentId: string,
  communityId: string,
  getUserProfile: (string) => Object,
  getUserImage: (Object) => string
}

let componentsToRenderBeforeTutorial: Set<string> = new Set(['panel', 'donation'])
export function registerReadyForTutorial (component: string) {
  componentsToRenderBeforeTutorial.delete(component)
  if (componentsToRenderBeforeTutorial.size === 0) {
    startMainIntro()
  }
}

export default class ControlPanel extends React.Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      isCollapsed: false,
      donateModalOpen: false,
      transactionTargetAgent: null,
      transactionErrorMessage: null,
      transactionAmount: 1
    }
    this.openTransactionModal = this.openTransactionModal.bind(this)
    this.hideTransactionModal = this.hideTransactionModal.bind(this)
    this.onTransact = this.onTransact.bind(this)
    this.onTransactionAmountChange = this.onTransactionAmountChange.bind(this)
    this.openDonateModal = this.openDonateModal.bind(this)
    this.hideDonateModal = this.hideDonateModal.bind(this)
    this.toggleCollapse = this.toggleCollapse.bind(this)
  }

  openTransactionModal (agentId: string) {
    this.hideDonateModal()
    const userProfile = this.props.getUserProfile(agentId)
    this.setState({transactionTargetAgent: agentId,
      transactionTargetName: userNameFromProfile(userProfile),
      transactionTargetImageSrc: this.props.getUserImage(userProfile)})
  }

  onTransact () {
    makeTransaction(getCurrentAgentId(), getCurrentCommunityId(), this.state.transactionAmount,
      this.state.transactionTargetAgent, 'donation').then(res => {
      if (res.status) {
        this.hideTransactionModal()
      } else {
        this.setState({transactionErrorMessage: res.value})
      }
    })
  }

  onTransactionAmountChange (amount: string) {
    if (!(typeof amount === 'string' && amount.length === 0)) {
      if (amount[amount.length - 1] !== '.') {
        let checkedAmount = convertStringToValidAmount(amount)
        this.setState({
          transactionAmount: checkedAmount.amount === null ? this.state.transactionAmount : checkedAmount.amount,
          transactionErrorMessage: checkedAmount.error
        })
      } else {
        this.setState({transactionAmount: amount})
      }
    } else {
      this.setState({transactionAmount: null})
    }
  }

  openDonateModal () {
    this.setState({donateModalOpen: true})
  }

  hideDonateModal () {
    this.setState({donateModalOpen: false})
  }

  hideTransactionModal () {
    this.setState({transactionTargetAgent: null, transactionAmount: null, transactionErrorMessage: null})
  }

  toggleCollapse () {
    this.setState({isCollapsed: !this.state.isCollapsed})
  }

  componentDidMount () {
    registerReadyForTutorial('panel')
  }

  render () {
    const openClose = <div className={'collapse-expand'} onClick={this.toggleCollapse}>
      {this.state.isCollapsed ? 'expand' : 'collapse'}
    </div>

    const donateModal = this.state.donateModalOpen
      ? <DonateModal getUserProfile={this.props.getUserProfile}
        getUserImage={this.props.getUserImage}
        isOpen={this.state.donateModalOpen} onHide={this.hideDonateModal}
        onSelect={this.openTransactionModal}
      /> : null
    return <div id={'plenty-control-panel'}
      className={this.state.isCollapsed ? 'collapsed' : 'expanded'}>
      {openClose}
      {donateModal}
      <TransactionAmountModal isOpen={!!this.state.transactionTargetAgent}
        agentName={this.state.transactionTargetName} agentImageSrc={this.state.transactionTargetImageSrc}
        onHide={this.hideTransactionModal}
        onAmountChange={this.onTransactionAmountChange} amount={this.state.transactionAmount}
        onSubmit={this.onTransact}
        errorMsg={this.state.transactionErrorMessage}
      />
      <DonationWindow getUserProfile={this.props.getUserProfile}
        getUserImage={this.props.getUserImage}
        onOpen={this.openDonateModal}/>
      <AccountStatus agentId={this.props.agentId} communityId={this.props.communityId}/>
    </div>
  }
}
