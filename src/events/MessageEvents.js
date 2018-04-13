// @flow

import {hasEnoughFunds, spend} from '../accounting/Accounting'
import {pushMessage} from '../db/MessageTable'
import type {Event} from './index'
import {COST_OF_SENDING_MESSAGE} from '../accounting/AccountingGlobals'

export const MESSAGE_EVENT_TYPE: 'message' = 'message'

export type MessageEventPayload = {
  messageId: string,
  channelId: string
}

export async function handleMessageEvent (event: Event): Promise<boolean> {
  const agentId = event.senderId
  const communityId = event.communityId
  const payload = validatePayload(event.payload)
  const channelId = payload.channelId

  const fc = await hasEnoughFunds(agentId, communityId, COST_OF_SENDING_MESSAGE)
  if (fc) {
    pushMessage(payload.messageId, agentId, channelId)
    console.log('Handled message event', event)
    return spend(agentId, communityId, COST_OF_SENDING_MESSAGE).then(r => true)
  }
  return false
}

// just a stub for now. should throw exception if invalid
function validatePayload (payload): MessageEventPayload {
  if (!payload) throw new Error('Invalid message payload')
  if (!payload.channelId) throw new Error('Message playload missing channel')
  const p = (payload: MessageEventPayload)
  return p
}
