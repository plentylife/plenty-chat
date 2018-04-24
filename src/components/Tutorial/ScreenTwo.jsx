// flow

import React from 'react'
import './style.scss'
import {DASH} from './index'

type Props = {}

export default function ScreenTwo (props: Props) {
  return <div className={'tutorial-screen screen-two'}>
    <h3>Truly social crypto-currency</h3>
    <span>
      <p>We are one of a kind crypto-currency. Unlike the rest, we {'aren\'t'} out to make a buck. We are the first not-for-profit project of this kind.</p>
      <p>Directly improving the lives of people is our goal {DASH} Plenty acts as the social fabric that bonds friends into micro-communities</p>
      <p>{'We\'ve'} integrated Plenty into a chat app, which helps to bring friends together around things they love to do</p>
      <p>And lets organizations enjoy teams that are self-organized, efficient, and effective</p>
    </span>
  </div>
}
