import test from 'ava'
import {startSync} from '../../src/sync/SyncClient'
import '../../src/db/index'
import {nSQL} from 'nano-sql'

nSQL().connect()

test.serial('full setup on onConnect', t => {
  startSync(['http://localhost:3000'])

  return timeout(5000).then(() => t.pass())
})

function timeout (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
