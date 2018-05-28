// flow

import React from 'react'
import './style.scss'
import {ABOUT_CURRENCY_URL, DASH} from './index'
import {PLENTY, THANKS} from '../utils'

type Props = {}

export default function ScreenFour (props: Props) {
  return <div className={'tutorial-screen screen-four'}>
    <p>We are all wealthy</p>

    <p>{PLENTY} simply makes money reflect real, human wealth</p>

    <p>By introducing <a target='_blank' href={ABOUT_CURRENCY_URL}>natural currency</a> {DASH} {THANKS} {DASH} into a chat platform we can make sure that there is {PLENTY} of {THANKS} for all</p>

    <p>Through simple, day-to-day conversation you can introduce this little miracle within your micro-community of family, neighbours, co-workers, and friends</p>

    <p>We are all be wealthy</p>
  </div>
}
