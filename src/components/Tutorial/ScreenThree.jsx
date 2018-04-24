// flow

import React from 'react'
import './style.scss'
import {DASH} from './index'
import {TENGE} from '../utils'

type Props = {}

export default function ScreenThree (props: Props) {
  const mathUrl = ''

  return <div className={'tutorial-screen screen-three'}>
    <h3>{TENGE}hanks as money</h3>
    <span>
      <p>Our currency is called {TENGE}hanks</p>
      <p>Its special power is that it follows natural laws {DASH} with time it slowly disintegrates</p>
      <p>Without getting into <a target={'_blank'} href={mathUrl}>the math</a>, if the global financial system was based on {TENGE}hanks,
        we would watch corporations fight to preserve the Amazon. {'Wouldn\'t'} you want to live in such a world?</p>
    </span>
  </div>
}
