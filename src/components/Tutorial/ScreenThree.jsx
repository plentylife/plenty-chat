// flow

import React from 'react'
import './style.scss'
import {DASH} from './index'
import {THANKS} from '../utils'

type Props = {}

export default function ScreenThree (props: Props) {
  return <div className={'tutorial-screen screen-three'}>
    <p>We are all wealthy</p>
    <p>We are all interconnected</p>

    <p>Civilization wholly depends on money</p>
    <p>Civilization wholly depends on conversation</p>

    <p>We combined the two: we put money {DASH} {THANKS} {DASH} where it belongs. We put money inside a chat platform</p>
  </div>
}
