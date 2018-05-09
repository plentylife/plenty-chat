// @flow

import type {Event} from './index'
import type {DemurrageByProperty} from '../accounting/Demurrage'
import {applyDemurrageToWallet, getWallet, setBalance} from '../db/AgentWalletTable'
import type {PotSplitEntry} from '../accounting/CommunityPot'
import {getCommunityBalance, setCommunityBalance} from '../db/CommunityTable'
import {assertNumber, assertPositive, floorWithPrecision} from '../accounting/utils'
import {MissingProperty} from '../utils/Error'

export const DEMURRAGE_EVENT_TYPE: 'demurrage' = 'demurrage'

export const COMMUNITY_POT_SPLIT_EVENT_TYPE: 'potSplit' = 'potSplit'

export const TRANSACTION_EVENT_TYPE: 'transaction' = 'transaction'

export type DemurragePayload = DemurrageByProperty & {
  agendId: string
}

const TRANSACTION_TYPES = ['message', 'peer', 'donation']

export type TransactionPayload = {
  transactionType: 'message' | 'peer' | 'donation',
  amount: number,
  recipientAgentId: string,
  messageId: ?string
}

export async function handleDemurrageEvent (event: Event): Promise<boolean> {
  const p = (event.payload : DemurragePayload)
  return applyDemurrageToWallet(
    p.agentId, event.communityId, p
  ).then(affR => (affR.length > 0))
}

export async function handleCommunityPotSplit (event: Event): Promise<boolean> {
  const p: Array<PotSplitEntry> = (event.payload: Array<PotSplitEntry>)
  if (!(p instanceof Array)) throw new TypeError('Pot split event payload must be an array')
  const payload = [...p]
  console.log(`Splitting Community (${event.communityId}) ${payload.length} ways`, payload)
  let entry = payload.shift()
  while (entry && entry.amount !== 0) {
    const communityBalance = await getCommunityBalance(event.communityId) // fixme move up
    const wallet = await getWallet(entry.agentId, event.communityId)
    const newCommBalance = floorWithPrecision(communityBalance - entry.amount)
    const newAgentBalance = floorWithPrecision(wallet.balance + entry.amount)
    await setBalance(entry.agentId, event.communityId, newAgentBalance)
    await setCommunityBalance(event.communityId, newCommBalance)
    console.log(`Handling community split for agent ${entry.agentId} ${communityBalance} - ${entry.amount} = ${newCommBalance}`)
    entry = payload.shift()
  }
  return true
}

export function validateTransactionType (type: string): string {
  if (!TRANSACTION_TYPES.includes(type)) throw new TypeError(`Invalid transaction type [${type}]`)
  return type
}

export function validateTransactionPayload (payload: TransactionPayload): TransactionPayload {
  assertNumber(payload.amount)
  assertPositive(payload.amount)
  if (!payload.transactionType) throw new MissingProperty('transaction type')
  validateTransactionType(payload.transactionType)
  if (!payload.recipientAgentId) throw new MissingProperty('recipient agent id of the transactoin')
  if (payload.transactionType === 'message' && !payload.messageId) throw new MissingProperty('message id in transaction details')
  return payload
}
