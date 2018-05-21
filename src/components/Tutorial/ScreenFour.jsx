// flow

import React from 'react'
import './style.scss'
import {DASH} from './index'
import {PLENTY, THANKS} from '../utils'

type Props = {}

export default function ScreenFour (props: Props) {
  return <div className={'tutorial-screen screen-four'}>
    <p>We are all wealthy</p>

    <p>{PLENTY} simply makes our bank account reflect it</p>

    <p>By introducing natural money {DASH} {THANKS} {DASH} into a chat platform we can make sure that there is {PLENTY} of {THANKS} for all</p>
  </div>
}
