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

export const GIVE_BUTTON_INTRO = `Whenever you see a message that deserves some ${ThanksSpan}, use this button to give some. It could be somebody offering help, or sharing a great idea ${DASH} make sure to give them some ${ThanksSpan}`

const INVITE_INTRO = 'Invite your friends using the links in the menu.'

const MAIN_INTRO_SETTING_KEY = 'main_intro'
const GIVE_BUTTON_INTRO_SETTING_KEY = 'give_button_intro'

export const ABOUT_CURRENCY_URL = 'http://about.plenty.life/#currency'

let mainIntroComplete = false
let giveButtonIntroStarted = false

export async function startIntro () {
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
  } else {
    startGiveButtonIntro()
  }
}

function startHints () {
  const teamHeader = document.getElementById('teamHeader')
  let hintElem
  if (teamHeader.getBoundingClientRect().x < 0) {
    const header = document.getElementsByClassName('navbar-header')[0]
    hintElem = header
  } else {
    hintElem = teamHeader
  }
  IntroJs().setOptions({
    hints: [
      { hint: INVITE_INTRO, element: hintElem, hintPosition: 'middle-right' }
    ]
  }).addHints()
}

async function completeMainIntro () {
  mainIntroComplete = true
  await pushSimpleSetting(MAIN_INTRO_SETTING_KEY, true)

  startHints()
  startGiveButtonIntro()
}

export async function startGiveButtonIntro () {
  mainIntroComplete = await getBooleanSetting(MAIN_INTRO_SETTING_KEY)
  if (mainIntroComplete && !giveButtonIntroStarted) {
    giveButtonIntroStarted = true
    const hasCompleted = await getBooleanSetting(GIVE_BUTTON_INTRO_SETTING_KEY)

    if (!hasCompleted) {
      let giveBtn = getGiveButtonToIntro()
      if (giveBtn) {
        const gbr = giveBtn.getBoundingClientRect()

        giveBtn = giveBtn.getElementsByClassName('btn')[0]
        const scrollableContainer = document.getElementById('post-list').getElementsByClassName('post-list-holder-by-time')[0]
        const initialScroll = scrollableContainer.scrollTop

        console.log('Starting give button intro on button', giveBtn)
        const intro = IntroJs()
          .setOptions({
            steps: [{intro: GIVE_BUTTON_INTRO, position: 'right', element: giveBtn}]
          })
          .setOption('scrollToElement', false)
          .setOption('exitOnOverlayClick', false)
          .setOption('showProgress', false)
          .setOption('showBullets', false)

        intro.oncomplete(completeGiveButtonIntro)
        intro.onexit(completeGiveButtonIntro)
        intro.start()

        console.log('bounding rectangle for give button intro', gbr)
        document.getElementsByClassName('introjs-helperLayer')[0].style.top = `${gbr.top}px`
        document.getElementsByClassName('introjs-helperLayer')[0].style.height = `${gbr.height}px`
        document.getElementsByClassName('introjs-tooltipReferenceLayer')[0].style.top = `${gbr.top}px`

        scrollableContainer.scrollTop = initialScroll
      }
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
    if (offset >= 0 && (offset < minimum || minimum === null)) {
      minimum = offset
      winner = b
    }
  })

  return winner
}

export {
  ScreenOne, ScreenTwo, ScreenThree, ScreenFour, ScreenFive, ScreenTasks, ScreenCaveat
}
