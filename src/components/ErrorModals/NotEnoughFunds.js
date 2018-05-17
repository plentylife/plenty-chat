// @flow
import React from 'react'
import {Modal} from 'react-bootstrap'
import Balance from '../AccountStatus/Balance'
// import {CRON_TIME} from '../../state/GlobalState'
import './notEnoughFundsStyle.css'
import {THANKS} from '../utils'

type Props = {
  show: boolean,
  onClose: () => void,
  // how many thanks were asked for
  // requestedAmount: number
}

export function NotEnoughFundsForMessageModal (props: Props) {
  return <Modal dialogClassName={'not-enough-funds-modal'} show={props.show} onHide={props.onClose} keyboard={true}>
    <Modal.Header closeButton={true}>
      <Modal.Title>Not enough funds</Modal.Title>
    </Modal.Header>

    <Modal.Body>
      <p>It costs <Balance amount={1}/> to send a message</p>
      <p>Other community members might donate you some {THANKS}, but in the meantime you {'won\'t'} be able to message</p>
    </Modal.Body>
  </Modal>
}

// {/*<p>Those go into the community pot, which then gets split evenly between all members</p>*/}
// {/*<p>*/}
// {/*The community pot is split every {CRON_TIME} minutes*/}
// {/*</p>*/}
