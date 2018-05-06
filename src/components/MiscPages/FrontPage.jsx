import React from 'react'
import {Button} from 'react-bootstrap'
import './frontPage.scss'

export default function FrontPage (props) {
  console.log('front page props', props)
  return <div className={'front-page'}>
    <div>
      <div className={'img-holder'}>
      </div>
      <div className={'subtitle'}>
        <span className={'top'}>Changing the meaning of profit,</span><br/>
        <span className={'middle'}>so that corporations can</span><br/>
        <span className={'bottom'}>become guardians of the world</span>
      </div>
      <Button bsStyle="primary" className={'login-action'} onClick={() => {
        props.history.push('/login' + props.location.search)
      }}>
      Login
      </Button>
    </div>
  </div>
}
