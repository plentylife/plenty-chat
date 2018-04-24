// flow

import React from 'react'
import './style.scss'
import {DASH} from './index'

type Props = {}

export default function ScreenOne (props: Props) {
  const cryptoUrl = 'foreign'

  return <div className={'tutorial-screen screen-one'}>
    <h3>Plenty, where greed is a virtue</h3>
    <span>
      <p>Our goal is to make goodwill profitable.</p>
      <p>In our world today, profit is often synonymous with abuse. We will reverse that.</p>
      <p>
        Plenty is a <a target='_blank' href={cryptoUrl}>natural crypto-currency</a>. {'It\'s'} very special because its mechanics are
        opposite of the dollar {DASH} Plenty makes doing the right thing, the profitable thing.
      </p>
    </span>
  </div>
}
