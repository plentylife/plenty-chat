import test from 'ava'
import {pushMessage} from '../src/db/MessageTable'
import {nSQL} from 'nano-sql'
import {rateMessage} from '../src/actions/RatingActions'
import {getRating} from '../src/db/RatingTable'
import apEq from 'approximately-equal'

console.log('NODE_ENV is ', process.env.NODE_ENV)

const MSG_ID = 'tmid'
const USER_ID = 'uid'
const NUM_STARS = 3

async function addMessage (t, rating, expected) {
  t.plan(1)

  await rateMessage(USER_ID, MSG_ID, rating, NUM_STARS)
  const ratingInDb = await getRating(USER_ID, MSG_ID)
  t.true(apEq(ratingInDb, expected, 0.01))
}
addMessage.title = (providedTitle, input, expected) => `${providedTitle} ${input} = ${expected}`.trim()

nSQL().connect().then(async () => {
  await pushMessage(MSG_ID, 'tcid')

  test.serial('adding message rating', addMessage, 1, 0.33)
  test.serial('adding message rating', addMessage, 2, 0.66)
  test.serial('adding message rating', addMessage, 3, 1)

  test.serial('adding inappropriate message rating', t => {
    t.throws(() => {
      rateMessage(USER_ID, MSG_ID, 0, NUM_STARS)
    })
  })

  test.serial('wrong star setup', t => {
    t.throws(() => {
      rateMessage(USER_ID, MSG_ID, 1, 0)
    })
    t.throws(() => {
      rateMessage(USER_ID, MSG_ID, 2, 1)
    })
  })
})
