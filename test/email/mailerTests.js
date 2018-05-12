import test from 'ava'
import {Decimal} from 'decimal.js/decimal'
import {generateEmailHtml} from '../../src/email/Template'
import {sendMail} from '../../src/email/Mailer'

test('sending an html template', async t => {
  const html = await generateEmailHtml(11, {
    balance: -69, creditLimit: 65.3948, outgoingStat: 3, incomingStat: 10.5
  }, Decimal(456.2354), Decimal(4))

  await sendMail('antonkats@gmail.com', html)
    .then(() => t.pass()).catch(e => t.fail(e))
})
