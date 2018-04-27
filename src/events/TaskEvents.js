// @flow

import {hasEnoughFunds, spend} from '../accounting/Accounting'
import {pushMessage} from '../db/MessageTable'
import type {Event, EventResult} from './index'
import {COST_OF_SENDING_MESSAGE} from '../accounting/AccountingGlobals'
import {pushNewTask} from '../db/TaskTable'

export const CONVERT_TO_TASK_EVENT_TYPE: 'convertToTask' = 'convertToTask'
export const DECONVERT_TASK_EVENT_TYPE: 'deconvertTask' = 'deconvertTask'
export const CHANGE_TASK_STATUS_EVENT_TYPE: 'changeTaskStatus' = 'changeTaskStatus'

export type ConvertToTaskEventPayload = {
  parentMessageId: string
}

export async function handleConvertToTaskEvent (event: Event): Promise<EventResult> {
  const agentId = event.senderId
  const payload = validateConversionPayload(event.payload)
  const parentMsgId = payload.parentMessageId

  const taskId = await pushNewTask(parentMsgId, agentId)
  return {status: !!taskId, value: taskId}
}

// just a stub for now. should throw exception if invalid
function validateConversionPayload (payload: Object): ConvertToTaskEventPayload {
  if (!payload.parentMessageId) throw new Error('Message playload missing channel')
  const p = (payload: ConvertToTaskEventPayload)
  return p
}
