import test from 'ava'
import {_setDemurrageTimestamps, addCommunitySharePoints, getWallet, setBalance} from '../../src/db/AgentWalletTable'
import {LENGTH_OF_DAY} from '../../src/accounting/AccountingGlobals'
import {setupDb} from '../utils'
import apEq from 'approximately-equal'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {applyDemurrageToAll} from '../../src/actions/AccountingActions'

const AGENT_ID_POOR = 'uid_poor'
const AGENT_ID_RICH = 'uid_rich'
const AGENTS = [AGENT_ID_POOR, AGENT_ID_RICH]
const COMMUNITY_ID = 'cid'

const TIMESTAMP = new Date().getTime()

console.log(`Now is ${TIMESTAMP}`)

test.before(t => {
  setupDb(t).then(async () => {
    addAgentToCommunity(AGENT_ID_POOR, COMMUNITY_ID)
    addAgentToCommunity(AGENT_ID_RICH, COMMUNITY_ID)
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

function makeDemurrageTimestamps (balance, communitySharePoints) {
  return {
    balance, communitySharePoints
  }
}

test.serial('doing demurrage on a new agents', async t => {
  await applyDemurrageToAll()
  await macroCheckWallets(t, [
    {b: 0, sp: 0}, {b: 0, sp: 0}
  ])
  // check that dates changed
  const now = new Date().getTime()
  const wp = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)
  const wr = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)
  t.true(apEq(wp.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wr.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wp.demurrageTimestamps.communitySharePoints, now, 50))
  t.true(apEq(wr.demurrageTimestamps.communitySharePoints, now, 50))
})

test.serial('doing demurrage on a older agents that do not have community share points', async t => {
  const ts = TIMESTAMP - LENGTH_OF_DAY
  const dts = makeDemurrageTimestamps(ts, ts)
  await _setDemurrageTimestamps(AGENT_ID_POOR, COMMUNITY_ID, dts)
  await _setDemurrageTimestamps(AGENT_ID_RICH, COMMUNITY_ID, dts)
  await setBalance(AGENT_ID_POOR, COMMUNITY_ID, 50)
  await setBalance(AGENT_ID_RICH, COMMUNITY_ID, 100)

  await applyDemurrageToAll()

  await macroCheckWallets(t, [
    {b: 49, sp: 0}, {b: 98, sp: 0}
  ])
  const wp = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)
  const wr = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)

  const now = new Date().getTime()
  t.true(apEq(wp.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wr.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wp.demurrageTimestamps.communitySharePoints, now, 50))
  t.true(apEq(wr.demurrageTimestamps.communitySharePoints, now, 50))
})

test.serial('some community share points', async t => {
  await addCommunitySharePoints(AGENT_ID_POOR, COMMUNITY_ID, 1)
  await addCommunitySharePoints(AGENT_ID_POOR, COMMUNITY_ID, 100)
  const wpStart = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)

  await applyDemurrageToAll()
  await macroCheckWallets(t, [
    {b: 48, sp: 1}, {b: 96, sp: 98}
  ])

  const wp = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)
  const wr = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)

  const now = new Date().getTime()
  t.true(apEq(wp.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wr.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wr.demurrageTimestamps.communitySharePoints, now, 50))

  // timestamps for community share points should not change (for poor)
  t.is(wp.demurrageTimestamps.communitySharePoints, wpStart.demurrageTimestamps.communitySharePoints)
})

test.serial('gone broke', async t => {
  await setBalance(AGENT_ID_POOR, COMMUNITY_ID, 1)
  const wpStart = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)

  await applyDemurrageToAll()
  await macroCheckWallets(t, [
    {b: 1, sp: 1}, {b: 96, sp: 98}
  ])

  const wp = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)
  const wr = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)

  const now = new Date().getTime()

  t.true(apEq(wp.demurrageTimestamps.communitySharePoints, now, 50))
  t.true(apEq(wr.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wr.demurrageTimestamps.communitySharePoints, now, 50))

  // timestamps for balance should not change
  t.is(wp.demurrageTimestamps.balance, wpStart.demurrageTimestamps.balance)
})
