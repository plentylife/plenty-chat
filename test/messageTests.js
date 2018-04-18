import test from 'ava'
import {pushMessage, getMessage} from '../src/db/MessageTable'
import {nSQL} from 'nano-sql'
import {sendMessage} from '../src/actions/MessageActions'
import {getWallet, setBalance} from '../src/db/AgentWalletTable'
import {DEFAULT_CREDIT_LIMIT} from '../src/accounting/AccountingGlobals'
import {getCommunityBalance} from '../src/db/CommunityTable'
import {getCommunityOfChannel, setCommunityOfChannel} from '../src/db/ChannelTable'

console.log('NODE_ENV is ', process.env.NODE_ENV)

const AGENT_ID = 'uid'
const COMMUNITY_ID = 'comid'
const CHANNEL_ID = 'chid'

nSQL().connect().then(async () => {
  test.before('setting up channel to community mapping', async t => {
    await setCommunityOfChannel(CHANNEL_ID, COMMUNITY_ID)
    const c = await getCommunityOfChannel(CHANNEL_ID)

    t.is(c, COMMUNITY_ID)
  })

  test('adding message to db', async t => {
    const MSG_ID = 'tmid_simple'
    t.plan(2)

    await pushMessage(MSG_ID, AGENT_ID, CHANNEL_ID)
    const qGet = await getMessage(MSG_ID)

    t.truthy(qGet)
    t.is(qGet.channelId, CHANNEL_ID)
  })

  test.serial('sending message without existing wallet', async t => {
    const MSG_ID = 'tmid_fail_nw'

    t.false(await sendMessage(AGENT_ID, CHANNEL_ID, MSG_ID))
    const msg = await getMessage(MSG_ID)
    const balance = await getWallet(AGENT_ID, COMMUNITY_ID)
    const cb = await getCommunityBalance(COMMUNITY_ID)

    t.is(cb, 0)
    t.is(balance, null)
    t.is(msg, null)
  })

  test.serial('sending message without enough funds', async t => {
    const MSG_ID = 'tmid_fail_ne'

    const initBalance = -1 * DEFAULT_CREDIT_LIMIT
    await setBalance(AGENT_ID, COMMUNITY_ID, initBalance)
    t.false(await sendMessage(AGENT_ID, CHANNEL_ID, MSG_ID))
    const msg = await getMessage(MSG_ID)
    const balance = await getWallet(AGENT_ID, COMMUNITY_ID)
    const cb = await getCommunityBalance(COMMUNITY_ID)

    t.is(cb, 0)
    t.is(balance.balance, initBalance)
    t.is(msg, null)
  })

  test.serial('sending message', async t => {
    const MSG_ID = 'tmid_sending'

    await setBalance(AGENT_ID, COMMUNITY_ID, 0)
    await t.true(await sendMessage(AGENT_ID, CHANNEL_ID, MSG_ID))
    const msg = await getMessage(MSG_ID)
    const balance = await getWallet(AGENT_ID, COMMUNITY_ID)
    const cb = await getCommunityBalance(COMMUNITY_ID)

    t.is(cb, 1)
    t.is(balance.balance, -1)
    t.is(msg.id, MSG_ID)
  })
})
