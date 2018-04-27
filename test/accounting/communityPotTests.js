import test from 'ava'
import {setupDb} from '../utils'
import apEq from 'approximately-equal'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {splitAllCommunityPots} from '../../src/actions/AccountingActions'
import {initializeCommunity} from '../../src/accounting/Accounting'
import {getCommunityBalance, setCommunityBalance} from '../../src/db/CommunityTable'
import {EVENT_TABLE} from '../../src/db/EventTable'
import {COMMUNITY_POT_SPLIT} from '../../src/events/AccountingEvents'
import {nSQL} from 'nano-sql'
import {addCommunitySharePoints, getWallet} from '../../src/db/AgentWalletTable'
import {DEFAULT_COMMUNITY_SHARE_POINTS} from '../../src/accounting/AccountingGlobals'

const NUM_AGENTS = 3
const AGENTS = []
const AGENT_POINTS = [10, 20, 30]
for (let i = 0; i < NUM_AGENTS; i++) {
  AGENTS.push(`agent-id-${i}`)
}
const COMMUNITY_ID = 'cid'

test.before(t => {
  return setupDb(t).then(async () => {
    await Promise.all(AGENTS.map(async (a, i) => {
      await addAgentToCommunity(a, COMMUNITY_ID)
      await addCommunitySharePoints(a, COMMUNITY_ID, -DEFAULT_COMMUNITY_SHARE_POINTS) // fixme
      await addCommunitySharePoints(a, COMMUNITY_ID, AGENT_POINTS[i])
    }))
    await initializeCommunity(COMMUNITY_ID)

    await macroCheckWallets(t, [
      {b: 0, sp: 10}, {b: 0, sp: 20}, {b: 0, sp: 30}
    ])
  })
})

function macroCheckWallets (t, ex) {
  const ps = AGENTS.map(async (a, i) => {
    const w = await getWallet(a, COMMUNITY_ID)
    t.true(apEq(w.balance, ex[i].b))
    t.true(apEq(w.communitySharePoints, ex[i].sp))
  })
  return Promise.all(ps)
}

test.serial('nothing is split if pot is empty', async t => {
  await splitAllCommunityPots()
  await macroCheckWallets(t, [
    {b: 0, sp: 10}, {b: 0, sp: 20}, {b: 0, sp: 30}
  ])
})

test.serial('pot is split properly', async t => {
  await setCommunityBalance(COMMUNITY_ID, 60)
  await splitAllCommunityPots()

  await macroCheckWallets(t, [
    {b: 10, sp: 10}, {b: 20, sp: 20}, {b: 30, sp: 30}
  ])
  t.is(await getCommunityBalance(COMMUNITY_ID), 0)
})

test.serial('pot should be fully split, always, event it if means fractions', async t => {
  await setCommunityBalance(COMMUNITY_ID, 61)
  await splitAllCommunityPots()

  await macroCheckWallets(t, [
    {b: 20.16, sp: 10}, {b: 40.33, sp: 20}, {b: 60.5, sp: 30}
  ])
  t.true(apEq(await getCommunityBalance(COMMUNITY_ID), 0.01))
})

test.serial('pot split event should have an array as payload', async t => {
  const rows = await nSQL(EVENT_TABLE).query('select').where(['eventType', '=', COMMUNITY_POT_SPLIT]).exec()
  rows.forEach((r) => {
    t.true(r.payload instanceof Array)
    t.true(r.payload.length === NUM_AGENTS)
  })
})

test.todo('when communty pot is nothing. division by zero')

test.todo('with multile communities')
