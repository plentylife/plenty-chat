// flow

import React from 'react'
import './style.scss'
import {DASH} from './index'

type Props = {}

export default function ScreenOne (props: Props) {
  const cryptoUrl = 'http://about.plenty.life/#currency'

  return <div className={'tutorial-screen screen-one'}>
    <h3>Plenty, where greed is a virtue</h3>
    <span>
      <p>Our goal is to make goodwill profitable.</p>
      <p>In our world today, profit is often synonymous with abuse. We are putting an end to that.</p>
      <p>
        <span className={'plenty-word'}>Plenty</span> is a <a target='_blank' href={cryptoUrl}>natural crypto-currency</a>. {'It\'s'} very special because its mechanics are
        opposite of the dollar {DASH} <span className={'plenty-word'}>Plenty</span> makes doing the right thing, the profitable thing.
      </p>
    </span>
  </div>
}
