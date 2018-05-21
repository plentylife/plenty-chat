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
import {TENGE} from '../utils'

export const DASH = '\u2013'

const PlentySpan = '<span class="plenty-word">Plenty</span>'
const ThanksSpan = `<span class='thanks-word'>${TENGE}hanks</span>\n`

export const ACCOUNT_INTRO = `This is the heart of ${PlentySpan}. It shows information about your account standing and the community.`

export const BALANCE_INTRO = `This is your account balance in ${ThanksSpan}`
export const DEMURRAGE_INTRO = `Since ${ThanksSpan} are a natural currency, they spoil. This is the rate at which your balance is spoiling. The more you spend, the slower your money will spoil.`

export const CREDIT_LIMIT_INTRO = `${ThanksSpan} are a mutual credit currency, meaning that you can have a negative balance, up to the credit limit. This limit changes based ` +
  'on how much you earn.'

export const COMMUNITY_BALANCE_INTRO = `Some ${ThanksSpan}, like the ones that spoiled, go into the community pot. This account is held jointly between all members of the community.`

export const SHARE_INTRO = `Every so often, the community pot is split between members. This is your share.`

export const GIVE_BUTTON_INTRO = `Whenever you see a message that deserves some ${ThanksSpan}, use this button to give some.`

const MAIN_INTRO_SETTING_KEY = 'main_intro'
const GIVE_BUTTON_INTRO_SETTING_KEY = 'give_button_intro'

let mainIntroComplete = false
let giveButtonIntroStarted = false

export async function startMainIntro () {
  mainIntroComplete = await getBooleanSetting(MAIN_INTRO_SETTING_KEY)
  if (!mainIntroComplete) {
    let exited = false
    const intro = IntroJs()
      .setOption('showProgress', true)
      .setOption('exitOnOverlayClick', false)
      .setOption('hidePrev', true)
      .setOption('hideNext', true)
      .setOption('showBullets', false)
      .start()
    intro.oncomplete(completeMainIntro)
    intro.onexit(() => {
      if (!exited) {
        exited = true
        completeMainIntro()
      }
    })
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
