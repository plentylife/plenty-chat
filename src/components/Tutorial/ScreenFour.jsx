// flow

import React from 'react'
import './style.scss'
import {DASH} from './index'
import BalancePic from './balance.png'
import {PLENTY, TENGE, THANKS} from '../utils'
import Highlight from './Highlight'

type Props = {}

export default function ScreenFour (props: Props) {
  return <div className={'tutorial-screen screen-four'}>
    <h3>Integrated into community life</h3>
    <p className={'balance-img-container'}>
      <img src={BalancePic} />
    </p>
    <p>Use {PLENTY} to organize events and projects. It helps to <Highlight>organically</Highlight> select leaders, manage tasks and track contributions
     by using {THANKS}.</p>
    <p>As soon as you join a community, you can earn and spend <span className={'thanks-word'}>{TENGE}hanks</span>. There is no need to buy them first.</p>
    <p><span className={'thanks-word'}>{TENGE}hanks</span> are issued by mutual credit {DASH} each member acts as their own little bank, creating money for others.</p>
    <p>The screenshot shows a typical account. Each member has a balance, which can be negative up to the credit limit.
       Each community has a community pot, which is split between members based on how involved they are and how much they contribute.</p>
  </div>
}

//    <p>This is because each community has {'it\'s'} own separate currency. This way each community is in control, and {'it\'s'} money is secure.</p>
