// @flow

import {hasEnoughFunds, spend} from '../accounting/Accounting'
import {pushMessage} from '../db/MessageTable'
import type {MessageEventPayload, Event} from './index'
import {COST_OF_SENDING_MESSAGE} from '../accounting/AccountingGlobals'

export const MESSAGE_EVENT_TYPE: 'message' = 'message'

export async function handleMessageEvent (event: Event): Promise<boolean> {
  const userId = event.senderId
  const communityId = event.communityId
  validatePayload(event.payload)

  const p = event.payload
  const fc = await hasEnoughFunds(userId, communityId, COST_OF_SENDING_MESSAGE)
  if (fc) {
    pushMessage(p.messageId, userId, communityId)
    return spend(userId, communityId, COST_OF_SENDING_MESSAGE).then(r => true)
  }
  return false
}

// just a stub for now. should throw exception if invalid
function validatePayload (payload): MessageEventPayload {
  if (!payload) throw new Error('Invalid message payload')
  const p = (payload: MessageEventPayload)
  return p
}
