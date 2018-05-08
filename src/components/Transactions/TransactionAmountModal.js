import React from 'react'
import {Alert, Button, Modal} from 'react-bootstrap'
import {TENGE, THANKS} from '../utils'
import './transactionAmountModal.scss'

type Props = {
  agentName: string,
  agentImageSrc: string,
  isOpen: boolean,
  onHide: () => void,
  onAmountChange: (any) => void,
  errorMsg: string,
  onSubmit: () => void
}

export default function TransactionAmountModal (props: Props) {
  return <Modal show={props.isOpen} keyboard={true} onHide={props.onHide} dialogClassName="transaction-amount">
    <Modal.Header closeButton={true}>
      <Modal.Title>Amount</Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <p className={'question'}>
        How many {THANKS} do you want to {'give'}
        <span className={'avatar'}>
          <img src={props.agentImageSrc}/>
        </span>
        <span className={'agent-name'}>
          {props.agentName}
        </span>
        ?
      </p>
      <p className={'input-holder'}>
        <input type={'text'} onChange={e => props.onAmountChange(e.target.value)}/>
        <Button bsStyle={'primary'} onClick={props.onSubmit}>Give {TENGE}</Button>
      </p>
      {!props.errorMsg ? null : <Alert bsStyle={'danger'}>
        {props.errorMsg}
      </Alert>
      }
    </Modal.Body>
    <Modal.Footer>
      <Button bsStyle={'danger'} onClick={props.onHide}>Cancel</Button>
    </Modal.Footer>
  </Modal>
}
