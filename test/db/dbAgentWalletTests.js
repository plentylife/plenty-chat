import {nSQL} from 'nano-sql/lib/index'
import test from 'ava/index'
import {DB_MODE} from '../../src/state/GlobalState'
import {initializeAccount} from '../../src/accounting/Accounting'
import {addCommunitySharePoints, getCommunitySharePoints} from '../../src/db/AgentWalletTable'

const COMMUNITY_ID = 'comid'
const AGENT_ID = 'aid'

test.before(t => {
  return nSQL().connect().then(async (r) => {
    console.log('Connected to DB', r)
    t.is(DB_MODE, 'TEMP')
  }).then(() => {
    return initializeAccount(AGENT_ID, COMMUNITY_ID)
  })
})

async function testPointAmount (t, amount) {
  const cps = await getCommunitySharePoints(COMMUNITY_ID)
  t.is(cps.length, 1)
  t.is(cps[0].communitySharePoints, amount)
  t.is(cps[0].agentId, AGENT_ID)
}

test.serial('share points should be zero to start', testPointAmount, 0)

test.serial('share points should be addable', async t => {
  await addCommunitySharePoints(AGENT_ID, COMMUNITY_ID, 10)
  await testPointAmount(t, 10)
})

test.serial('share points should be subtractable', async t => {
  await addCommunitySharePoints(AGENT_ID, COMMUNITY_ID, -9)
  await testPointAmount(t, 1)
})

test.serial('share points should be not be below 0', async t => {
  await t.throws(addCommunitySharePoints(AGENT_ID, COMMUNITY_ID, -9))
  await testPointAmount(t, 1)
})
