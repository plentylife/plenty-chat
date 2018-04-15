import test from 'ava'
import {connectToPeer} from '../../src/sync/SyncClient'
import {onConnectToPeer, requestCommunityUpdate} from '../../src/sync'

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
    console.log('update request ack', ack)
    t.pass()
  })
})

test.serial('full setup on onConnect', t => {
  return onConnectToPeer(peer).then(ack => {
    console.log('update request ack', ack)
    t.pass()
  })
})

// function timeout(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }
