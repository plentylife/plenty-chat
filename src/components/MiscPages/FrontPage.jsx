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
      <div className={'login-action'}>
        <Button bsStyle="primary" onClick={() => {
          props.history.push('/login' + props.location.search)
        }}>
          Login
        </Button>
        <a className={'story-link'} href={'http://about.plenty.life'}>Read our story</a>
      </div>

    </div>
  </div>
}
