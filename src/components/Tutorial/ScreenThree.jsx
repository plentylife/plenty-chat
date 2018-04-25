// flow

import React from 'react'
import './style.scss'
import {DASH} from './index'
import {TENGE} from '../utils'

type Props = {}

export default function ScreenThree (props: Props) {
  const mathUrl = 'http://about.plenty.life/#for-curious'

  return <div className={'tutorial-screen screen-three'}>
    <h3><span className={'thanks-word'}>{TENGE}hanks</span> as money</h3>
    <span>
      <p>Our currency is called <span className={'thanks-word'}>{TENGE}hanks</span>.</p>
      <p>Its special power is that it follows natural laws {DASH} with time it slowly disintegrates.</p>
      <p>Without getting into <a target={'_blank'} href={mathUrl}>the math</a>, if the global financial system was based on <span className={'thanks-word'}>{TENGE}hanks</span>,
        we would be watching corporations fight to preserve the Amazon. {'Wouldn\'t'} you want to live in such a world?</p>
    </span>
  </div>
}
