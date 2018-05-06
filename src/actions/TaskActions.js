// @flow

import {sendEvent} from '../events'
import {CONVERT_TO_TASK_EVENT_TYPE} from '../events/TaskEvents'
import {getCurrentAgentId} from '../state/GlobalState'
import {getCommunityFromMessageOrCurrent} from './utils'
import type {EventResult} from '../events'

export async function convertMessageIntoTask (msgId: string): Promise<EventResult> {
  const communityId = await getCommunityFromMessageOrCurrent(msgId)

  return sendEvent(CONVERT_TO_TASK_EVENT_TYPE, getCurrentAgentId(), communityId, {
    parentMessageId: msgId
  })
}

export async function deconvertTask (taskId: string): Promise<boolean> {}

export async function completeTask (taskId: string): Promise<boolean> {}
