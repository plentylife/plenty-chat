import test from 'ava'
import {createMessage} from '../src/db/MessageTable'
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

  const qRate = await rateMessage(USER_ID, MSG_ID, rating, NUM_STARS)
  console.log('rating upsert', qRate)
  const ratingInDb = await getRating(USER_ID, MSG_ID)
  console.log('rating in db', ratingInDb)
  t.true(apEq(ratingInDb, expected, 0.01))
}
addMessage.title = (providedTitle, input, expected) => `${providedTitle} ${input} = ${expected}`.trim()

nSQL().connect().then(async () => {
  await createMessage(MSG_ID, 'tcid')

  test.serial('adding message rating', addMessage, 1, 0.33)
  test.serial('adding message rating', addMessage, 2, 0.66)
  test.serial('adding message rating', addMessage, 3, 1)
})
