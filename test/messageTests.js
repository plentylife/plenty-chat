import test from 'ava'
import {pushMessage, getMessage} from '../src/db/MessageTable'
import {nSQL} from 'nano-sql'
import {sendMessage} from '../src/actions/MessageActions'
import {getBalance, setBalance} from '../src/db/UserWalletTable'
import {DEFAULT_CREDIT_LIMIT} from '../src/accounting/AccountingGlobals'
import {getCommunityBalance} from '../src/db/CommunityTable'

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
    const balance = await getBalance(USER_ID, COMMUNITY_ID)
    const cb = await getCommunityBalance(COMMUNITY_ID)

    t.is(cb, 0)
    t.is(balance, null)
    t.is(msg, null)
  })

  test.serial('sending message without enough funds', async t => {
    const MSG_ID = 'tmid_fail_ne'

    const initBalance = -1 * DEFAULT_CREDIT_LIMIT
    await setBalance(USER_ID, COMMUNITY_ID, initBalance)
    t.false(await sendMessage(USER_ID, COMMUNITY_ID, MSG_ID))
    const msg = await getMessage(MSG_ID)
    const balance = await getBalance(USER_ID, COMMUNITY_ID)
    const cb = await getCommunityBalance(COMMUNITY_ID)

    t.is(cb, 0)
    t.is(balance.balance, initBalance)
    t.is(msg, null)
  })

  test.serial('sending message', async t => {
    const MSG_ID = 'tmid_sending'

    await setBalance(USER_ID, COMMUNITY_ID, 0)
    await t.true(await sendMessage(USER_ID, COMMUNITY_ID, MSG_ID))
    const msg = await getMessage(MSG_ID)
    const balance = await getBalance(USER_ID, COMMUNITY_ID)
    const cb = await getCommunityBalance(COMMUNITY_ID)

    t.is(cb, 1)
    t.is(balance.balance, -1)
    t.is(msg.id, MSG_ID)
  })
})
