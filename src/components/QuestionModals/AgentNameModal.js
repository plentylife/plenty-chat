// @flow
import React from 'react'
import {Button, Modal} from 'react-bootstrap'
import {mmUserGetter, mmUserSetter} from '../../mmintegration'
import './agentNameModal.scss'
import {getCurrentAgentId} from '../../state/GlobalState'

type Props = {}

export default class AgentNameModal extends React.Component<Props> {
  constructor (props) {
    super(props)
    this.state = {
      show: AgentNameModal.shouldShow(),
      first: '',
      last: ''
    }
    this.setName = this.setName.bind(this)
    this.save = this.save.bind(this)
  }

  setName (fl, e) {
    const name = e.target.value
    let no = {}
    if (fl === 'f') {
      no.first = name
    } else {
      no.last = name
    }
    this.setState(no)
  }

  save () {
    let fullName = this.state.first + this.state.last
    if (fullName) {
      let user = Object.assign({}, mmUserGetter(getCurrentAgentId()))
      user.first_name = this.state.first
      user.last_name = this.state.last
      mmUserSetter(user)
    }
    this.setState({show: false})
  }

  static shouldShow () {
    if (mmUserGetter) {
      let user = mmUserGetter(getCurrentAgentId())
      let fullName = user.last_name + user.first_name
      if (!fullName.trim()) {
        return true
      }
    }
    return false
  }

  render () {
    return <Modal dialogClassName={'agent-name-modal'} show={this.state.show} keyboard={true} onHide={this.save}>
      <Modal.Header closeButton={true}>
        <Modal.Title>What is your name?</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{'You\'re'} amongst friends. Make it easier for them to recognize you!</p>
        <div className={'inputs-container'}>
          <div>
            <label>First name</label>
            <input type='text' placeholder={'Jane'} onChange={e => this.setName('f', e)}/>
          </div>
          <div>
            <label>Last name</label>
            <input type='text' placeholder={'Doe'} onChange={e => this.setName('l', e)}/>
          </div>
        </div>
        <div className={'button-holder'}>
          <Button bsStyle="primary" onClick={this.save}>Save</Button>
        </div>
      </Modal.Body>
    </Modal>
  }
}
