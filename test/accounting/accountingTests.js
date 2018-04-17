import test from 'ava'
import {getBalance, setBalance} from '../../src/db/AgentWalletTable'
import {hasEnoughFunds} from '../../src/accounting/Accounting'
import {nSQL} from 'nano-sql'
import {DEFAULT_CREDIT_LIMIT} from '../../src/accounting/AccountingGlobals'

const AGENT_ID = 'uid'
const COMMUNITY_ID = 'cid'

nSQL().connect().then(() => {
  test.serial('has enough funds', async t => {
    await setBalance(AGENT_ID, COMMUNITY_ID, 0)
    const c = await hasEnoughFunds(AGENT_ID, COMMUNITY_ID, 1)
    t.true(c)
  })

  test.serial('does not have enough funds', async t => {
    await setBalance(AGENT_ID, COMMUNITY_ID, -1 * DEFAULT_CREDIT_LIMIT)
    const c = await hasEnoughFunds(AGENT_ID, COMMUNITY_ID, 1)
    t.false(c)
  })

  test.serial('setBalance does not affect existing credit limit', async t => {
    await setBalance(AGENT_ID, COMMUNITY_ID, 0)
    const b = await getBalance(AGENT_ID, COMMUNITY_ID)

    if (b === null) throw new Error('Failed to get balance')
    t.is(b.creditLimit, DEFAULT_CREDIT_LIMIT)
  })

  test('improper fund check', t => {
    t.throws(() => {
      return hasEnoughFunds(AGENT_ID, COMMUNITY_ID)
    })
  })

  test.todo('balance cannot be set below credit limit')
})
