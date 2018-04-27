// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_MODE} from '../state/GlobalState'
import {AGENT_TABLE} from './AgentTable'
import {rowOrNull} from './index'
// import {COMMUNITY_TABLE} from './CommunityTable'

export const TASK_TABLE = 'Task'
const TASK_STATUS = ['incomplete', 'complete']

export type TaskRow = {taskId: string, creatorId: string, parentMessgeId: string, status: string, completionTime: number, markedCompletedBy: ?string}

const taskTable = nSQL(TASK_TABLE).model([
  {key: 'taskId', type: 'uuid', props: ['pk', 'ai']},
  {key: 'creatorId', type: AGENT_TABLE},
  {key: 'parentMessageId', type: TASK_TABLE, props: ['idx']},
  // could be one of [incomplete, complete]
  {key: 'status', type: 'string', default: TASK_STATUS[0]},
  // this is according to the creator, not this agent
  {key: 'completionTime', type: 'number', default: -1},
  // might not necessarily be one of the bidders
  {key: 'markedCompletedBy', type: AGENT_TABLE}
]).config({mode: DB_MODE || 'PERM'})

export async function pushNewTask (parentMessageId: string, creatorId: string): Promise<string | null> {
  // console.log('pushing message with id', id)
  if (!parentMessageId) throw new Error('Task must have parent message id')
  if (!creatorId) throw new Error('Task must have creator id')
  if (await getTaskByParent(parentMessageId)) throw new Error('Task already exists')

  return nSQL(TASK_TABLE).query('upsert', {
    creatorId, parentMessageId
  }).exec().then(r => {
    return r.affectedRows[0] ? r.affectedRows[0].taskId : null
  })
}

export async function changeStatus (taskId: string, status: string, actingAgent: string, timestamp: number): Promise<boolean> {
  if (!taskId) throw new Error('To change status of task, an id must be present')
  if (!TASK_STATUS.includes(status)) throw new Error(`Status ${status} is not one of ${TASK_STATUS}`)
  if (!actingAgent) throw new Error('When changing task status, there must be an acting agent')
  if (!(await getTask(taskId))) throw new Error(`Task with id ${taskId} does not exists`)

  let upsert = {taskId, status}
  if (status === TASK_STATUS[TASK_STATUS.length - 1]) {
    upsert.completionTime = timestamp
    upsert.markedCompletedBy = actingAgent
  }

  return nSQL(TASK_TABLE).query('upsert', upsert).exec().then(r => (r.affectedRows.length > 0))
}

export function getTask (taskId: string): Promise<TaskRow | null> {
  return nSQL(TASK_TABLE).query('select').where(['id', '=', taskId]).exec().then(rowOrNull)
}

function getTaskByParent (parentMessageId: string): Promise<TaskRow | null> {
  return nSQL(TASK_TABLE).query('select').where(['parentMessageId', '=', parentMessageId]).exec().then(rowOrNull)
}

export default taskTable
