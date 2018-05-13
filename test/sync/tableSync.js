import test from 'ava'
import {dropAll, setupDb} from '../utils'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {createChannel} from '../../src/actions/ChannelActions'
import {sendMessage} from '../../src/actions/MessageActions'
import {generateAllTableSyncMessages, receiveTableSyncMessage} from '../../src/sync/TableSync'
import {getCommunityOfChannel} from '../../src/db/ChannelTable'
import {getAllWallets} from '../../src/db/AgentWalletTable'
import {getCommunityBalance} from '../../src/db/CommunityTable'
import {MESSAGE_TABLE} from '../../src/db/tableNames'
import {EVENT_TABLE, getEvents, SELF_EVENT_TABLE} from '../../src/db/EventTable'
import {getSyncedUpToInAll, PEER_SYNC_TABLE} from '../../src/db/PeerSyncTable'
import {nSQL} from 'nano-sql'
import {CHANNEL_TABLE} from '../../src/db/tableNames'

const AGENT_ID = 'uid'
const PEER_ID = 'peer-id'
const COMMUNITY_ID = 'comid'
const CHANNEL_ID = 'chid'
const MESSAGE_ID = 'mid'
const PEER = {
  agentId: PEER_ID
}

let lastEventTime = 0
test.before(async t => {
  await setupDb(t)

  await createChannel(AGENT_ID, CHANNEL_ID, COMMUNITY_ID)
  await addAgentToCommunity(AGENT_ID, COMMUNITY_ID)
  await sendMessage(AGENT_ID, CHANNEL_ID, MESSAGE_ID)
  const events = await getEvents(0)
  lastEventTime = Math.max(...events.map(e => (e.timestamp)))
})

let messages = []

test.serial('if selected by time, only some entries should be synced', async t => {
  messages = await generateAllTableSyncMessages(new Date().getTime())
  const mt = messages.find(m => m.table === MESSAGE_TABLE)
  const et = messages.find(m => m.table === EVENT_TABLE)
  t.falsy(mt)
  t.falsy(et)
})

test.serial('all table entries should become sync messages', async t => {
  messages = await generateAllTableSyncMessages(0)
  messages.forEach(m => console.log(m))
  const mt = messages.find(m => m.table === MESSAGE_TABLE).entries
  const et = messages.find(m => m.table === EVENT_TABLE).entries
  t.true(mt.length > 0)
  t.true(et.length > 0)
  t.true(messages.length > 0)
})

test.serial('tables should be updated on the other end', async t => {
  await dropAll()
  await Promise.all(messages.map(m => {
    return receiveTableSyncMessage(PEER, m)
  }))

  const ch = await getCommunityOfChannel(CHANNEL_ID)
  const ws = await getAllWallets()
  const comBal = await getCommunityBalance(COMMUNITY_ID)
  const syncTime = await getSyncedUpToInAll(PEER_ID)

  t.is(COMMUNITY_ID, ch)
  t.is(ws.length, 1)
  t.is(ws[0].balance, -1)
  t.is(comBal, 1)
  t.is(syncTime, lastEventTime)
})

test.serial('events should have a proper received from', async t => {
  const events = await getEvents(0)
  events.forEach(e => {
    t.true(e.receivedFrom.has(PEER_ID))
  })
})

test.serial('some tables should not be synced across agents', async t => {
  const msgs = await generateAllTableSyncMessages(0)
  t.falsy(msgs.find(m => (m.table === PEER_SYNC_TABLE)))
  t.falsy(msgs.find(m => (m.table === SELF_EVENT_TABLE)))
})
