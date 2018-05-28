import React from 'react'
import {Button} from 'react-bootstrap'
import './frontPage.scss'

type Props = {
  location: {search: string},
  history: {push: (string) => void}
}

export default function FrontPage (props: Props) {
  console.log('front page props', props)
  return <div className={'front-page'}>
    <div>
      <div className={'img-holder'}>
      </div>
      <div className={'subtitle'}>
        <span className={'top'}>We are all wealthy</span>
      </div>
      <Button bsStyle="primary" className={'login-action'} onClick={() => {
        props.history.push('/login' + props.location.search)
      }}>
      Login
      </Button>
    </div>
  </div>
}
