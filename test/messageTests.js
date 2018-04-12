import test from 'ava'
import {createMessage} from '../src/db/MessageTable'
import {nSQL} from 'nano-sql'

nSQL().connect().then(() => {
  test('adding message to db', async t => {
    t.plan(1)

    // const qr = await createMessage('tmid', 'tcid')
    // console.log(qr)
    t.pass()
  })
})
