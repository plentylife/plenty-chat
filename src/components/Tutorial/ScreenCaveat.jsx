// flow

import React from 'react'
import './style.scss'
import {DASH} from './index'

type Props = {}

export default function ScreenCaveat (props: Props) {
  return <div className={'tutorial-screen screen-caveat'}>
    <h3>Last caveat</h3>
    <p>
      <span className={'plenty-word'}>Plenty</span> is a prototype.
    </p>
    <p>
      We {'aren\'t'} into re-inventing the wheel, so we built it on top of Mattermost {DASH} a chat app for teams. Sometimes
      we use different terminology from them, for example, Mattermost teams are <span className='plenty-word'>{'Plenty\'s'}</span> communities.
       But this way you get to enjoy a full blown messaging platform that is continuously improving.
    </p>
    <p>
      {'We'} are working hard at polishing <span className={'plenty-word'}>Plenty</span> up.
    </p>
    <p>
      Enjoy!
    </p>
  </div>
}
