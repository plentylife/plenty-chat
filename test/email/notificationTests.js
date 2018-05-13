import test from 'ava'
import {_dropDb, dropAll, setupDb} from '../utils'
import {setCommunityOfChannel} from '../../src/db/ChannelTable'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {pushAgent, registerNotification} from '../../src/db/AgentTable'
import {_countAgentNotifications, notifyAll} from '../../src/email/Notifications'
import {pushMessage} from '../../src/db/MessageTable'
import {AGENT_TABLE, MESSAGE_TABLE} from '../../src/db/tableNames'
import {nSQL} from 'nano-sql'
import {NOTIFY_PERIOD} from '../../src/email/Notifications'

const CHANNEL1 = 'chid1'
const CHANNEL2 = 'chid2'
const COMMUNITY1 = 'comid1'
const COMMUNITY2 = 'comid2'

test.before(async t => {
  await setupDb(t)
  await setCommunityOfChannel(CHANNEL1 + COMMUNITY1, COMMUNITY1)
  await setCommunityOfChannel(CHANNEL2 + COMMUNITY1, COMMUNITY1)
  await setCommunityOfChannel(CHANNEL1 + COMMUNITY2, COMMUNITY2)
  await setCommunityOfChannel(CHANNEL2 + COMMUNITY2, COMMUNITY2)
  await pushAgent('a1', 'antonkats@gmail.com')
  await pushAgent('a2', 'andreyploskov@gmail.com')

  const agents = await nSQL(AGENT_TABLE).query('select').exec()
  t.is(agents.length, 2)
})

async function rn(time) {
  await registerNotification('a1', time)
  await registerNotification('a2', time)
}

test.serial('first notification, single community, single user', async t => {
  await addAgentToCommunity('a1', COMMUNITY1)
  await pushMessage('m1', 'a1', CHANNEL1 + COMMUNITY1)
  await pushMessage('m2', 'a2', CHANNEL2 + COMMUNITY1)

  const counts = await _countAgentNotifications()
  await registerNotification('a1')

  counts.forEach((c, a) => {
    if (a.agentId === 'a1') t.is(c, 2)
    if (a.agentId !== 'a1') t.fail()
  })
})

test.serial('single community, both users, first notification for a2', async t => {
  await addAgentToCommunity('a2', COMMUNITY1)
  await pushMessage('m3', 'a1', CHANNEL1 + COMMUNITY1)
  await pushMessage('m4', 'a2', CHANNEL2 + COMMUNITY1)
  // this one should not be registered
  await nSQL(MESSAGE_TABLE).query('upsert', {
    id: 'mold', senderId: 'oth', channelId: CHANNEL1 + COMMUNITY1, timestamp: 0
  }).exec()

  const counts = await _countAgentNotifications()
  await rn()

  counts.forEach((c, a) => {
    if (a.agentId === 'a1') t.fail() // shouldn't be included because of notification time
    if (a.agentId === 'a2') t.is(c, 4)
  })
})

test.serial('two communities, both users in one, one in the other', async t => {
  await rn(new Date().getTime() - NOTIFY_PERIOD - 1)
  await addAgentToCommunity('a1', COMMUNITY2)
  await _dropDb(MESSAGE_TABLE)

  await pushMessage('m5', 'a1', CHANNEL1 + COMMUNITY1)
  await pushMessage('m6', 'a2', CHANNEL2 + COMMUNITY2)

  const counts = await _countAgentNotifications()

  counts.forEach((c, a) => {
    if (a.agentId === 'a1') t.is(c, 2) // shouldn't be included because of notification time
    if (a.agentId === 'a2') t.is(c, 1)
  })
})

test.serial('send the emails', async t => {
  await notifyAll()
  t.pass()
})
