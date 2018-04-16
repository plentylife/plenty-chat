import test from 'ava'
import {connectToPeer} from '../../src/sync/SyncClient'
import {onConnectToPeer, requestCommunityUpdate} from '../../src/sync'
import '../../src/db/index'
import {nSQL} from 'nano-sql'

nSQL().connect()

let peer = null

const COMMUNITY_ID = 'comid'

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

  return timeout(5000).then(() => {
    t.is(peer.agentId, 'server-default-id')
    t.pass()
  })
})

function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
