// @flow

import {sendEvent} from '../events'
import {CONVERT_TO_TASK_EVENT_TYPE} from '../events/TaskEvents'
import {getCurrentAgentId} from '../state/GlobalState'
import {getCommunityFromMessageOrCurrent} from './utils'

export async function convertMessageIntoTask (msgId: string): Promise<boolean> {
  const communityId = getCommunityFromMessageOrCurrent(msgId)

  return sendEvent(CONVERT_TO_TASK_EVENT_TYPE, getCurrentAgentId(), communityId, {
    parentMessageId: msgId
  })
}

export async function deconvertTask (taskId: string): Promise<boolean> {}

export async function completeTask (taskId: string): Promise<boolean> {}
