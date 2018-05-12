import test from 'ava'
import {generateEmailHtml} from '../../src/email/Template'
import fs from 'fs'
import {Decimal} from 'decimal.js'

test('generate html', async t => {
  const html = await generateEmailHtml(10, {
    balance: -69, creditLimit: 65.3948, outgoingStat: 5, incomingStat: 10.5
  }, Decimal(456.2354), Decimal(4))
  await new Promise(resolve => {
    fs.writeFile('test/email/output.html', html, resolve)
  })
  t.pass()
})
