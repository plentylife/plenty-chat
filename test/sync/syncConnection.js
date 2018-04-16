import test from 'ava'
import {connectToPeer} from '../../src/sync/SyncClient'
import {EVENT_CHANNEL, onConnectToPeer, registerSendEventsObserver, requestCommunityUpdate} from '../../src/sync'
import '../../src/db/index'
import {nSQL} from 'nano-sql'
import sinon from 'sinon'
import {createChannel} from '../../src/actions/ChannelActions'
import {getCommunityOfChannel} from '../../src/db/ChannelTable'
import {getEvents} from '../../src/db/EventTable'
import {DB_MODE} from '../../src/state/GlobalState'
import {CREATE_CHANNEL_EVENT_TYPE} from '../../src/events/ChannelEvents'

let peer = null

const AGENT_ID = 'uid'
const COMMUNITY_ID = 'comid'
const CHANNEL_ID = 'chid'

test.before(t => {
  t.is(DB_MODE, 'TEMP')
  return (nSQL().connect())
})

test.serial('connection should succeed', t => {
  return connectToPeer('http://localhost:3000').then(p => {
    peer = p
    t.truthy(p)
  })
})

test.serial('request for updates should sent', t => {
  return requestCommunityUpdate(peer.socket, COMMUNITY_ID, 0).then(ack => {
    console.log('TEST. update request ack', ack)
    t.pass()
  })
})

test.serial('full setup on onConnect', t => {
  onConnectToPeer(peer)

  return timeout(1000).then(() => {
    t.is(peer.agentId, 'server-default-id')
    t.pass()
  })
})

test.serial('new events should be sent out', async t => {
  console.log('\n\n========\n\n')
  // stub the peer
  const spy = sinon.spy(peer.socket, 'emit').withArgs(EVENT_CHANNEL)
  registerSendEventsObserver()

  const time = new Date().getTime()

  await createChannel(AGENT_ID, CHANNEL_ID, COMMUNITY_ID)
  const newEvents = await getEvents(time)
  t.is(await getCommunityOfChannel(CHANNEL_ID), COMMUNITY_ID)
  t.true(newEvents.length > 0)

  await timeout(1000)
  t.true(spy.calledOnce)
  t.is(spy.firstCall.args[1].eventType, CREATE_CHANNEL_EVENT_TYPE)
  t.is(spy.firstCall.args[1].receivedFrom.length, 0)
})

function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
