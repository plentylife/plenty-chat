// flow

import React from 'react'
import './style.scss'

type Props = {}

export default function ScreenOne (props: Props) {
  return <div className={'tutorial-screen screen-one'}>
    <p>We are all wealthy</p>

    <p>But, rich or poor, our bank account does not reflect how good of a parent we are, how good of a community member we are, how good of a friend we are</p>

    <p>{'Shouldn\'t'} it?</p>
  </div>
}
