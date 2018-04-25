// flow

import React from 'react'
import './style.scss'
import {TENGE} from '../utils'
import Stars from './stars.png'

type Props = {}

export default function ScreenFive (props: Props) {
  return <div className={'tutorial-screen screen-five'}>
    <h3>Organic rewards</h3>
    <p>
      When anyone sends a chat message, it costs them 1 <span className={'thanks-word'}>{TENGE}hanks</span>, which goes into the community pot.
    </p>
    <p>
      Others can rate this message, using <img src={Stars} className={'stars-img'} />. The more high ratings a member has
      the more money they will receive from the community pot when it is split.
    </p>
    <p>
      This motivates members to send relevant and useful messages.
    </p>
  </div>
}
