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
  const allButotns = document.getElementsByClassName('give-button-wrapper')
  return allButotns
}

export {
  ScreenOne, ScreenTwo, ScreenThree, ScreenFour, ScreenFive, ScreenTasks, ScreenCaveat
}
