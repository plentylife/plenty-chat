import test from 'ava'
import {connectToPeer} from '../../src/sync/SyncClient'

test('connection should succeed', t => {
  return connectToPeer('http://localhost:3000').then(c => {
    t.pass()
  })
})