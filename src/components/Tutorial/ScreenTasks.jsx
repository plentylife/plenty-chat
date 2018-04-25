// flow

import React from 'react'
import './style.scss'
import {PLENTY, THANKS} from '../utils'
import Stars from './stars.png'
import {DASH} from './index'
import Highlight from './Highlight'

type Props = {}

export default function ScreenTasks (props: Props) {
  return <div className={'tutorial-screen screen-tasks'}>
    <h3>Tasks [upcoming]</h3>
    <p>
      If you have ever tried to organize an event, you know that there are tasks to give out. Any message can be marked as a <Highlight>Task</Highlight> that needs to be done.
    </p>
    <p>
      To take on a <Highlight>Task</Highlight> a member invests their {THANKS}. If they do a good job and get many high <img src={Stars} className={'stars-img'} /> ratings,
      they will earn more {THANKS} from the <Highlight>community pot</Highlight> than they have spent. If they do a poor job, they lose their investment.
    </p>
    <p>
      This solves a common problem with organizing groups {DASH} with {PLENTY} people are invested into their responsibilities.
    </p>
  </div>
}
