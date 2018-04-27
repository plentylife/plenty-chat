import {test} from 'ava'
import {setupDb} from '../utils'

test.before(async t => {
  await setupDb()
})

test.skip('rating a task', t => {

})
