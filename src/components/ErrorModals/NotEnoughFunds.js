// @flow
import React from 'react'
import {Modal} from 'react-bootstrap'

type Props = {
  show: boolean,
  onClose: () => void,
  // how many thanks were asked for
  // requestedAmount: number
}

export function NotEnoughFundsForMessageModal (props: Props) {
  return <Modal show={props.show} onHide={props.onClose} keyboard={true}>
    <Modal.Header closeButton={true}>
      <Modal.Title>Modal title</Modal.Title>
    </Modal.Header>

    <Modal.Body>One fine body...</Modal.Body>
  </Modal>
}
