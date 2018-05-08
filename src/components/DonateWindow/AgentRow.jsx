import React from 'react'
import {Button} from 'react-bootstrap'

type Props = {
  getProfile: (string) => Object,
  getImage: (Object) => string,
  agentId: string,
  plea: boolean
}

export default function AgentRow (props: Props) {
  const userProfile = props.getProfile(props.agentId)
  let plea = null
  if (props.plea) {
    plea = <span className={'plea'}>
      {' doesn\'t'} have enough funds to message. Help them out!
    </span>
  }
  return <div className={'agent-row'}>
    <span className={'avatar'}>
      <img src={props.getImage(userProfile)}/>
    </span>
    <span className={'plea-outer-box'}>
      <span className={'plea-container'}>
        <span className={'agent-name'}>
          {userProfile.first_name + ' ' + userProfile.last_name}
        </span>
        {plea}
      </span>
    </span>
    <Button bsStyle={'primary'}>Donate</Button>
  </div>
}
