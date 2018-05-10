import test from 'ava'
import {_setDemurrageTimestamps, addCommunitySharePoints, getWallet, setBalance} from '../../src/db/AgentWalletTable'
import {DEFAULT_COMMUNITY_SHARE_POINTS, LENGTH_OF_DAY} from '../../src/accounting/AccountingGlobals'
import {setupDb} from '../utils'
import apEq from 'approximately-equal'
import {addAgentToCommunity} from '../../src/actions/AgentActions'
import {applyDemurrageToAll} from '../../src/actions/AccountingActions'
import {setCurrentAgentId} from '../../src/state/GlobalState'

const AGENT_ID_POOR = 'uid_poor'
const AGENT_ID_RICH = 'uid_rich'
const AGENTS = [AGENT_ID_POOR, AGENT_ID_RICH]
const COMMUNITY_ID = 'cid'

setCurrentAgentId('server')

const TIMESTAMP = new Date().getTime()

console.log(`Now is ${TIMESTAMP}`)

test.before(t => {
  return setupDb(t).then(async () => {
    await addAgentToCommunity(AGENT_ID_POOR, COMMUNITY_ID)
    await addAgentToCommunity(AGENT_ID_RICH, COMMUNITY_ID)
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

async function setTimestampsToPast (days = 1) {
  const ts = TIMESTAMP - (LENGTH_OF_DAY * days)
  const dts = makeDemurrageTimestamps(ts, ts)
  await _setDemurrageTimestamps(AGENT_ID_POOR, COMMUNITY_ID, dts)
  await _setDemurrageTimestamps(AGENT_ID_RICH, COMMUNITY_ID, dts)
  return ts
}

let firstTimestamps = {}
AGENTS.forEach(a => { firstTimestamps[a] = {} })

test.serial('doing demurrage on a new agents', async t => {
  await applyDemurrageToAll()
  await macroCheckWallets(t, [
    {b: 0, sp: DEFAULT_COMMUNITY_SHARE_POINTS}, {b: 0, sp: DEFAULT_COMMUNITY_SHARE_POINTS}
  ])
  // check that dates changed
  const now = new Date().getTime()
  const wp = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)
  const wr = await getWallet(AGENT_ID_RICH, COMMUNITY_ID)

  firstTimestamps[AGENTS[0]] = wp.demurrageTimestamps
  firstTimestamps[AGENTS[1]] = wr.demurrageTimestamps

  t.true(apEq(wp.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wr.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wp.demurrageTimestamps.communitySharePoints, now, 50))
  t.true(apEq(wr.demurrageTimestamps.communitySharePoints, now, 50))
})

let lastTimestamps = {}

test.serial('doing demurrage on a older agents that do not have community share points', async t => {
  await setBalance(AGENT_ID_POOR, COMMUNITY_ID, 50)
  await setBalance(AGENT_ID_RICH, COMMUNITY_ID, 100)
  await addCommunitySharePoints(AGENT_ID_POOR, COMMUNITY_ID, -DEFAULT_COMMUNITY_SHARE_POINTS)
  await addCommunitySharePoints(AGENT_ID_RICH, COMMUNITY_ID, -DEFAULT_COMMUNITY_SHARE_POINTS)

  // increasing balance from zero should change timestamps
  let wp = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)
  let wr = await getWallet(AGENT_ID_RICH, COMMUNITY_ID)
  t.false(wp.demurrageTimestamps.balance === firstTimestamps[AGENTS[0]].balance)
  t.false(wr.demurrageTimestamps.balance === firstTimestamps[AGENTS[1]].balance)
  t.true(wp.demurrageTimestamps.communitySharePoints === firstTimestamps[AGENTS[0]].communitySharePoints)
  t.true(wr.demurrageTimestamps.communitySharePoints === firstTimestamps[AGENTS[1]].communitySharePoints)

  // setting timestamps after, because of the above
  const ts = await setTimestampsToPast()
  await applyDemurrageToAll()

  await macroCheckWallets(t, [
    {b: 49, sp: 0}, {b: 98, sp: 0}
  ])
  wp = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)
  wr = await getWallet(AGENT_ID_RICH, COMMUNITY_ID)

  const now = new Date().getTime()
  t.false(wp.demurrageTimestamps.balance === ts)
  t.false(wr.demurrageTimestamps.balance === ts)
  t.true(apEq(wp.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wr.demurrageTimestamps.balance, now, 50))

  // the community share points timestamps don't need to change, since balance is 0
  t.true(wp.demurrageTimestamps.communitySharePoints === ts)
  t.true(wr.demurrageTimestamps.communitySharePoints === ts)

  lastTimestamps[AGENTS[0]] = wp.demurrageTimestamps
  lastTimestamps[AGENTS[1]] = wr.demurrageTimestamps
})

test.serial('some community share points', async t => {
  await addCommunitySharePoints(AGENT_ID_POOR, COMMUNITY_ID, 1)
  await addCommunitySharePoints(AGENT_ID_RICH, COMMUNITY_ID, 100)
  let wp = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)
  let wr = await getWallet(AGENT_ID_RICH, COMMUNITY_ID)
  let now = new Date().getTime()

  t.true(wp.demurrageTimestamps.balance === lastTimestamps[AGENT_ID_POOR].balance)
  t.true(wr.demurrageTimestamps.balance === lastTimestamps[AGENT_ID_RICH].balance)
  // because community share points went from 0 to something
  t.true(wp.demurrageTimestamps.communitySharePoints !== lastTimestamps[AGENT_ID_POOR].communitySharePoints)
  t.true(wr.demurrageTimestamps.communitySharePoints !== lastTimestamps[AGENT_ID_RICH].communitySharePoints)
  t.true(apEq(wp.demurrageTimestamps.communitySharePoints, now, 50))
  t.true(apEq(wr.demurrageTimestamps.communitySharePoints, now, 50))

  const ts = await setTimestampsToPast()
  await applyDemurrageToAll()
  await macroCheckWallets(t, [
    {b: 48, sp: 1}, {b: 96, sp: 98}
  ])

  wp = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)
  wr = await getWallet(AGENT_ID_RICH, COMMUNITY_ID)

  now = new Date().getTime()
  t.true(apEq(wp.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wr.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wr.demurrageTimestamps.communitySharePoints, now, 50))

  // timestamps for community share points should not change (for poor)
  t.is(wp.demurrageTimestamps.communitySharePoints, ts)
})

test.serial('gone broke', async t => {
  await setBalance(AGENT_ID_POOR, COMMUNITY_ID, -1)

  const ts = await setTimestampsToPast()
  await applyDemurrageToAll()
  await macroCheckWallets(t, [
    {b: -1, sp: 1}, {b: 94, sp: 96}
  ])

  // todo test amounts of community points

  const wp = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)
  const wr = await getWallet(AGENT_ID_RICH, COMMUNITY_ID)

  const now = new Date().getTime()

  t.true(apEq(wr.demurrageTimestamps.balance, now, 50))
  t.true(apEq(wr.demurrageTimestamps.communitySharePoints, now, 50))

  // timestamps for balance should not change
  t.is(wp.demurrageTimestamps.communitySharePoints, ts)
  t.is(wp.demurrageTimestamps.balance, ts)
})

test.serial('nagative balance to positive balance should log proper timestamps', async t => {
  await setBalance(AGENT_ID_POOR, COMMUNITY_ID, 1)
  const wp = await getWallet(AGENT_ID_POOR, COMMUNITY_ID)

  const now = new Date().getTime()
  t.true(apEq(wp.demurrageTimestamps.balance, now, 50))
})

test.serial('even small amounts should eventually dissipate', async t => {
  const tsUnder = TIMESTAMP - (LENGTH_OF_DAY * 34)
  const tsOver = TIMESTAMP - (LENGTH_OF_DAY * 35)
  let dts = makeDemurrageTimestamps(tsOver, tsUnder)
  await _setDemurrageTimestamps(AGENT_ID_POOR, COMMUNITY_ID, dts)

  await applyDemurrageToAll()
  await macroCheckWallets(t, [
    {b: 0, sp: 1}, {b: 94, sp: 96}
  ])

  dts = makeDemurrageTimestamps(tsOver, tsOver)
  await _setDemurrageTimestamps(AGENT_ID_POOR, COMMUNITY_ID, dts)

  await applyDemurrageToAll()
  await macroCheckWallets(t, [
    {b: 0, sp: 0}, {b: 94, sp: 96}
  ])
})
