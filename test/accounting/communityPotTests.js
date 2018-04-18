import test from 'ava'
import {_setDemurrageTimestamps, addCommunitySharePoints, getWallet, setBalance} from '../../src/db/AgentWalletTable'
import {LENGTH_OF_DAY} from '../../src/accounting/AccountingGlobals'
import {setupDb} from '../utils'
import apEq from 'approximately-equal'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {applyDemurrageToAll, splitAllCommunityPots} from '../../src/actions/AccountingActions'
import {initializeCommunity} from '../../src/accounting/Accounting'
import {getCommunityBalance, setCommunityBalance} from '../../src/db/CommunityTable'

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

test.serial('if pot cannot be split fully with whole numbers, some thanks are left over for next time', async t => {
  await setCommunityBalance(COMMUNITY_ID, 61)
  await splitAllCommunityPots()

  await macroCheckWallets(t, [
    {b: 20, sp: 10}, {b: 40, sp: 20}, {b: 60, sp: 30}
  ])
  t.is(await getCommunityBalance(COMMUNITY_ID), 1)
})
