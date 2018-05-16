import ScreenOne from './ScreenOne'
import ScreenTwo from './ScreenTwo'
import ScreenThree from './ScreenThree'
import ScreenFour from './ScreenFour'
import ScreenFive from './ScreenFive'
import ScreenTasks from './ScreenTasks'
import ScreenCaveat from './ScreenCaveat'

export const DASH = '\u2013'

export const ACCOUNT_INTRO = 'this is account panel intro'

export const BALANCE_INTRO = 'balance intro'

export const DEMURRAGE_INTRO = 'dem intro'

export const CREDIT_LIMIT_INTRO = 'credit limit'

export const COMMUNITY_BALANCE_INTRO = 'com bal intro'

export const SHARE_INTRO = 'share intro'

export const GIVE_INTRO = 'give intro'

export function getGiveButtonToIntro () {
  const allButtons = document.getElementsByClassName('give-button-wrapper')

  // const messageList = null
  // let mlOffsetTop = 0
  // if (messageList) {
  //   const offset = el.getBoundingClientRect()
  //   mlOffsetTop = offset.top
  // }

  let minimum = 0
  let winner = null

  allButtons.forEach(b => {
    const offset = b.getBoundingClientRect().top
    if (offset >= 0 && offset < minimum) winner = b
  })

  return winner
}

export {
  ScreenOne, ScreenTwo, ScreenThree, ScreenFour, ScreenFive, ScreenTasks, ScreenCaveat
}
