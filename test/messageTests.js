import test from 'ava'
import {createMessage, getMessage} from '../src/db/MessageTable'
import {nSQL} from 'nano-sql'

console.log('NODE_ENV is ', process.env.NODE_ENV)

const MSG_ID = 'tmid'

nSQL().connect().then(() => {
  test('adding message to db', async t => {
    t.plan(2)

    await createMessage(MSG_ID, 'tcid')
    const qGet = await getMessage(MSG_ID)

    t.is(qGet.length, 1)
    t.is(qGet[0].communityId, 'tcid')
  })
})
