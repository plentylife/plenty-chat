// flow

import React from 'react'
import './style.scss'
import {THANKS} from '../utils'
import {ABOUT_CURRENCY_URL} from './index'

type Props = {}

export default function ScreenTwo (props: Props) {
  return <div className={'tutorial-screen screen-two'}>
    <p>We are all wealthy</p>

    <p>We would all be rich if {THANKS} were money</p>

    <p>So {'that\'s'} exactly what we did. We turned {THANKS} into a <a target='_blank' href={ABOUT_CURRENCY_URL}>natural currency</a></p>
  </div>
}
