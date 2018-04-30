import {test} from 'ava'
import {setupDb} from '../utils'
import {completeTask, convertMessageIntoTask, deconvertTask} from '../../src/actions/TaskActions'
import {getTask} from '../../src/db/TaskTable'
import {setCurrentAgentId, setCurrentCommunityId} from '../../src/state/GlobalState'
import {setCommunityOfChannel} from '../../src/db/ChannelTable'
import {pushMessage} from '../../src/db/MessageTable'
import {getCommunityEvents} from '../../src/db/EventTable'

const AGENT_ID = 'aid'
const CHANNEL_ID = 'chid'
const COMMUNITY_ID_MSG = 'commid'
const COMMUNITY_ID_CURRENT = 'commid'

test.before(async t => {
  await setupDb(t)
  setCurrentCommunityId(COMMUNITY_ID_CURRENT)
  setCurrentAgentId(AGENT_ID)
})

test.serial('convert a message that is not in db into to a task', async t => {
  const taskRes = await convertMessageIntoTask('not-in-db')
  const task = await getTask(taskRes.value)
  const events = await getCommunityEvents(COMMUNITY_ID_CURRENT, 0)

  t.true(taskRes.status)
  t.truthy(task)
  t.is(task.taskId, taskRes.value)
  t.is(events[0].payload.parentMessageId, 'not-in-db')
})

test.serial('convert a message to a task', async t => {
  const MSG_ID = 'in-db'
  await setCommunityOfChannel(CHANNEL_ID, COMMUNITY_ID_MSG)
  await pushMessage(MSG_ID, AGENT_ID, COMMUNITY_ID_MSG)

  const taskRes = await convertMessageIntoTask(MSG_ID)
  const task = await getTask(taskRes.value)

  t.true(taskRes.status)
  t.truthy(task)
  t.is(task.taskId, taskRes.value)
  t.is((await getCommunityEvents(COMMUNITY_ID_MSG, 0)[0].payload.parentMessageId), MSG_ID)
})

test.skip('de-convert a task into a message', async t => {
  const taskId = await convertMessageIntoTask('in-db')
  // get it
  await deconvertTask(taskId)
  // get all tasks
  // check that there are two, and taskID is missing
})

test.skip('completing a task', async t => {
  const taskId = await convertMessageIntoTask('comlete')
  await completeTask(taskId)
  // check that it is complete
  // check date of completion
})
