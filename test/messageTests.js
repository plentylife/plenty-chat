// @flow

import test from 'ava'
import {createMessage, getMessage} from '../src/db/MessageTable'
import {nSQL} from 'nano-sql'
import {sendMessage} from '../src/actions/MessageActions'

console.log('NODE_ENV is ', process.env.NODE_ENV)

const USER_ID = 'uid'
const COMMUNITY_ID = 'cid'

nSQL().connect().then(() => {
  test('adding message to db', async t => {
    const MSG_ID = 'tmid_simple'
    t.plan(2)

    await createMessage(MSG_ID, 'tcid')
    const qGet = await getMessage(MSG_ID)

    // $FlowFixMe
    t.truthy(qGet)
    t.is(qGet.communityId, 'tcid')
  })

  test.serial('sending message without enough funds', async t => {
    const MSG_ID = 'tmid_fail'

    t.throws(async () => {
      await sendMessage(USER_ID, COMMUNITY_ID, MSG_ID)
    })
    const msg = await getMessage(MSG_ID)

    t.is(msg, null)
  })

  test.serial('sending message', async t => {
    const MSG_ID = 'tmid_sending'

    sendMessage(USER_ID, COMMUNITY_ID, MSG_ID)
    const msg = await getMessage(MSG_ID)

    t.is(msg.id, MSG_ID)
  })
})
