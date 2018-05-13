import React from 'react'
import {convertStringToValidAmount} from '../../accounting/Accounting'
import {TENGE, userNameFromProfile} from '../utils'
import {mmImageGetter, mmUserGetter} from '../../mmintegration'
import TransactionAmountModal from './TransactionAmountModal'
import {Button} from 'react-bootstrap'
import './giveButton.scss'
import {makeTransactionOnMessage} from '../../actions/AccountingActions'
import {getCurrentAgentId, getCurrentCommunityId} from '../../state/GlobalState'

type Props = {
  messageId: string, channelId: string, messageSenderId: string
}

export default class GiveButton extends React.Component<Props> {
  constructor (props) {
    super(props)
    const profile = mmUserGetter(props.messageSenderId)
    this.state = {
      transactionTargetName: userNameFromProfile(profile),
      transactionTargetImageSrc: mmImageGetter(profile),
      transactionModalOpen: false,
      transactionErrorMessage: null,
      transactionAmount: 1
    }
    this.openTransactionModal = this.openTransactionModal.bind(this)
    this.hideTransactionModal = this.hideTransactionModal.bind(this)
    this.onTransact = this.onTransact.bind(this)
    this.onTransactionAmountChange = this.onTransactionAmountChange.bind(this)
  }

  openTransactionModal () {
    this.setState({transactionModalOpen: true})
  }

  onTransact () {
    const params = Object.assign({}, this.props, {
      agentId: getCurrentAgentId(), communityId: getCurrentCommunityId(), amount: this.state.transactionAmount
    })
    makeTransactionOnMessage(...params).then(res => {
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

  hideTransactionModal () {
    this.setState({transactionModalOpen: false, transactionErrorMessage: null})
  }

  render () {
    const modal = this.state.transactionModalOpen &&
      <TransactionAmountModal isOpen={this.state.transactionModalOpen}
        agentName={this.state.transactionTargetName}
        agentImageSrc={this.state.transactionTargetImageSrc}
        onHide={this.hideTransactionModal}
        onAmountChange={this.onTransactionAmountChange} amount={this.state.transactionAmount}
        onSubmit={this.onTransact}
        errorMsg={this.state.transactionErrorMessage}
      />

    return <div className={'give-button-wrapper'}>
      {modal}
      <Button onClick={this.openTransactionModal} bsStyle={'primary'}>Give {TENGE}</Button>
    </div>
  }
}
