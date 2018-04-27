import {test} from 'ava'
import {setupDb} from '../utils'
import {completeTask, convertMessageIntoTask, deconvertTask} from '../../src/actions/TaskActions'
import {getTask} from '../../src/db/TaskTable'

const AGENT_ID = 'aid'
const MSG_ID = 'mid'
const CHANNEL_ID = 'chid'
const COMMUNITY_ID = 'commid'

test.before(async t => {
  await setupDb(t)
})

test.serial('convert a message that is not in db into to a task', async t => {
  const taskRes = await convertMessageIntoTask('not-in-db')
  const task = await getTask(taskRes.value)
  t.true(taskRes.status)
  t.truthy(task)
  t.is(task.taskId, taskRes.value)
})

test.skip('convert a message to a task', async t => {
  const taskId = await convertMessageIntoTask('in-db')
  // get task
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
