import ScreenOne from './ScreenOne'
import ScreenTwo from './ScreenTwo'
import ScreenThree from './ScreenThree'
import ScreenFour from './ScreenFour'
import ScreenFive from './ScreenFive'
import ScreenTasks from './ScreenTasks'
import ScreenCaveat from './ScreenCaveat'
import IntroJs from 'intro.js/intro'
import 'intro.js/introjs.css'
import {getBooleanSetting, pushSimpleSetting} from '../../db/SettingsTable'

export const DASH = '\u2013'

export const ACCOUNT_INTRO = 'this is account panel intro'

export const BALANCE_INTRO = 'balance intro'

export const DEMURRAGE_INTRO = 'dem intro'

export const CREDIT_LIMIT_INTRO = 'credit limit'

export const COMMUNITY_BALANCE_INTRO = 'com bal intro'

export const SHARE_INTRO = 'share intro'

export const GIVE_BUTTON_INTRO = 'give intro'

const MAIN_INTRO_SETTING_KEY = 'main_intro'
const GIVE_BUTTON_INTRO_SETTING_KEY = 'give_button_intro'

let mainIntroComplete = false
let giveButtonIntroStarted = false

export async function startMainIntro () {
  mainIntroComplete = await getBooleanSetting(MAIN_INTRO_SETTING_KEY)
  if (!mainIntroComplete) {
    setTimeout(() => {
      let exited = false
      const intro = IntroJs()
        .setOption('showProgress', true)
        .setOption('exitOnOverlayClick', false)
        .setOption('showBullets', false)
        .start()
      intro.oncomplete(completeMainIntro)
      intro.onexit(() => {
        if (!exited) {
          exited = true
          completeMainIntro()
        }
      })
    }, 799)
  }
}

function completeMainIntro () {
  mainIntroComplete = true
  pushSimpleSetting(MAIN_INTRO_SETTING_KEY, true)

  const giveBtn = getGiveButtonToIntro()
  if (giveBtn) pushSimpleSetting(GIVE_BUTTON_INTRO_SETTING_KEY, true)
}

export async function startGiveButtonIntro () {
  mainIntroComplete = await getBooleanSetting(MAIN_INTRO_SETTING_KEY)
  if (mainIntroComplete && !giveButtonIntroStarted) {
    giveButtonIntroStarted = true
    const hasCompleted = await getBooleanSetting(GIVE_BUTTON_INTRO_SETTING_KEY)

    if (!hasCompleted) {
      const giveBtn = getGiveButtonToIntro()
      const intro = IntroJs(giveBtn)
        .setOption('exitOnOverlayClick', true)
        .setOption('showProgress', false)
        .setOption('showBullets', false)
        .start()

      intro.oncomplete(completeGiveButtonIntro)
      intro.onexit(completeGiveButtonIntro)
    }
  }
}

function completeGiveButtonIntro () {
  pushSimpleSetting(GIVE_BUTTON_INTRO_SETTING_KEY, true)
}

export function getGiveButtonToIntro () {
  const allButtons = document.getElementsByClassName('give-button-wrapper')

  const messageList = document.getElementById('post-list')
  let mlOffsetTop = 0
  if (messageList) {
    const offset = messageList.getBoundingClientRect()
    mlOffsetTop = offset.top
  }

  let minimum = null
  let winner = null

  Array.from(allButtons).forEach(b => {
    const offset = b.getBoundingClientRect().top - mlOffsetTop
    if ((offset >= 0 && offset < minimum) || minimum === null) {
      minimum = offset
      winner = b
    }
  })

  return winner
}

export {
  ScreenOne, ScreenTwo, ScreenThree, ScreenFour, ScreenFive, ScreenTasks, ScreenCaveat
}
