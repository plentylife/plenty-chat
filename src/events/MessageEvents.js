// @flow

import {Event} from './index'
import {hasEnoughFunds} from '../accounting/Accounting'
import {pushMessage} from '../db/MessageTable'
import type {MessageEventPayload} from './index'

export const MESSAGE_EVENT_TYPE = 'message'

export async function handleMessageEvent (event: Event): boolean {
  const userId = event.senderId
  const communityId = event.communityId
  validatePayload(event.payload)

  const p = event.payload
  const fc = await hasEnoughFunds(userId, communityId, 1)
  if (fc) {
    pushMessage(p.messageId, userId, communityId)
    return true
  }
  return false
}

// just a stub for now. should throw exception if invalid
function validatePayload (payload): MessageEventPayload {
  if (!payload) throw new Error('Invalid message payload')
  const p = (payload: MessageEventPayload)
  return p
}
