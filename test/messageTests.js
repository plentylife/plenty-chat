// @flow

import test from 'ava'
import {pushMessage, getMessage} from '../src/db/MessageTable'
import {nSQL} from 'nano-sql'
import {sendMessage} from '../src/actions/MessageActions'
import {setBalance} from '../src/db/UserWalletTable'
import {defaultCreditLimit} from '../src/accounting/AccountingGlobals'

console.log('NODE_ENV is ', process.env.NODE_ENV)

const USER_ID = 'uid'
const COMMUNITY_ID = 'cid'

nSQL().connect().then(() => {
  test('adding message to db', async t => {
    const MSG_ID = 'tmid_simple'
    t.plan(2)

    await pushMessage(MSG_ID, USER_ID, 'tcid')
    const qGet = await getMessage(MSG_ID)

    t.truthy(qGet)
    t.is(qGet.communityId, 'tcid')
  })

  test.serial('sending message without existing wallet', async t => {
    const MSG_ID = 'tmid_fail_nw'

    t.false(await sendMessage(USER_ID, COMMUNITY_ID, MSG_ID))
    const msg = await getMessage(MSG_ID)

    t.is(msg, null)
  })

  test.serial('sending message without enough funds', async t => {
    const MSG_ID = 'tmid_fail_ne'

    await setBalance(USER_ID, COMMUNITY_ID, -1 * defaultCreditLimit)
    t.false(await sendMessage(USER_ID, COMMUNITY_ID, MSG_ID))
    const msg = await getMessage(MSG_ID)

    t.is(msg, null)
  })

  test.serial('sending message', async t => {
    const MSG_ID = 'tmid_sending'

    await setBalance(USER_ID, COMMUNITY_ID, 0)
    await t.true(await sendMessage(USER_ID, COMMUNITY_ID, MSG_ID))
    const msg = await getMessage(MSG_ID)

    t.is(msg.id, MSG_ID)
  })
})
