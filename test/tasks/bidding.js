import {test} from 'ava'
import {setupDb} from '../utils'

test.before(async t => {
  await setupDb()
})

test.skip('bidding on a task, first bid', t => {

})

test.skip('bidding on a task, second bid, lower', t => {

})

test.skip('bidding on a task, second bid, higher', t => {

})

test.skip('removing a bid', t => {

})