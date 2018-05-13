// @flow

import {getAllWallets, getWallet} from '../db/AgentWalletTable'
import {calculateDemurrageForAgent} from '../accounting/Demurrage'
import {sendEvent} from '../events'
import {
  COMMUNITY_POT_SPLIT_EVENT_TYPE,
  DEMURRAGE_EVENT_TYPE, MESSAGE_TRANSACTION_TYPE,
  TRANSACTION_EVENT_TYPE, validateTransactionPayload,
  validateTransactionType
} from '../events/AccountingEvents'
import {getCurrentAgentId} from '../state/GlobalState'
import {getAllCommunities} from '../db/CommunityTable'
import {calculateCommunityPotSplit} from '../accounting/CommunityPot'
import type {EventResult} from '../events'
import {hasEnoughFunds, validateAndFormatTransactionAmount} from '../accounting/Accounting'
import {
  AMOUNT_UNDER_ZERO,
  NOT_ENOUGH_FUNDS,
  PROGRAMMER_ERROR,
  RECIPIENT_DOES_NOT_EXIST
} from '../utils/UserErrors'
import type {TransactionPayload} from '../events/AccountingEvents'

export async function applyDemurrageToAll (): Promise<boolean> {
  const wallets = await getAllWallets()
  const sentPromises = wallets.map(w => {
    const d = calculateDemurrageForAgent(w)
    let hasAnyNonZero = 0
    Object.keys(d).forEach(k => {
      hasAnyNonZero += d[k]
    })
    if (hasAnyNonZero > 0) {
      const payload = Object.assign({}, w, d) // fixme remove unnecessary properties from payload
      console.log(`Sending out demurrage for agent ${w.agentId} with payload ${JSON.stringify(payload)}`)
      return sendEvent(DEMURRAGE_EVENT_TYPE, getCurrentAgentId(), w.communityId, payload)
    } else {
      return Promise.resolve(true)
    }
  })
  return Promise.all(sentPromises)
}

export async function splitAllCommunityPots (): Promise<boolean> {
  const communities = await getAllCommunities()
  const promises = communities.map(c => {
    return calculateCommunityPotSplit(c.communityId, c.balance).then(splits => {
      return sendEvent(COMMUNITY_POT_SPLIT_EVENT_TYPE, getCurrentAgentId(), c.communityId, splits)
    })
  })
  return Promise.all(promises)
}

export function makeTransactionOnMessage (messageId: string, channelId: string, messageSenderId: string, agentId: string,
  communityId: string, amount: number): Promise<EventResult> {
  return makeTransaction(agentId, communityId, amount, messageSenderId, MESSAGE_TRANSACTION_TYPE, {
    messageId, channelId
  })
}

export async function makeTransaction (agentId: string, communityId: string, _amount: number,
  recipientAgentId: string, _type: string, additionalPayload: Object): Promise<EventResult> {
  try {
    const type = validateTransactionType(_type)
    const amount = validateAndFormatTransactionAmount(_amount)
    const hasFunds = await hasEnoughFunds(agentId, communityId, amount)
    if (!hasFunds) {
      return {status: false, value: NOT_ENOUGH_FUNDS}
    }
    const recipientExists = await getWallet(recipientAgentId, communityId)
    if (!recipientExists) {
      return {status: false, value: RECIPIENT_DOES_NOT_EXIST}
    }

    const payload: TransactionPayload = Object.assign({}, additionalPayload || {}, {
      transactionType: type,
      recipientAgentId,
      amount
    })
    validateTransactionPayload(payload, agentId)
    return sendEvent(TRANSACTION_EVENT_TYPE, agentId, communityId, payload)
  } catch (e) {
    let res: EventResult = {status: false, error: e}
    if (e instanceof RangeError) {
      res.value = AMOUNT_UNDER_ZERO
    } else {
      console.error('Making a transaction failed due to a programmer error', e)
      res.value = PROGRAMMER_ERROR
    }
    return res
  }
}
