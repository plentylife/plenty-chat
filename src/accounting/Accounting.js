// @flow

import {getBalance, setBalance} from '../db/AgentWalletTable'
import {assertPositive, assertInt} from './utils'
import {getCommunityBalance, setCommunityBalance} from '../db/CommunityTable'
import {COST_OF_SENDING_MESSAGE} from './AccountingGlobals'

export function initializeAccount (agentId: string, communityId: string): Promise<void> {
  // todo. share points are not intialized; currently they get stuck into db by default.
  return setBalance(agentId, communityId, 0).then(r =>
    (r.length > 0)
  )
}

export function initializeCommunity (communityId: string): Promise<void> {
  return setCommunityBalance(communityId, 0).then(r =>
    (r.length > 0)
  )
}

/**
 * Checks if the agent has enough funds according to the point of view of this agent
 *
 * @param agentId
 * @param communityId
 * @param {int} amount has to be an integer
 */
export function hasEnoughFunds (agentId: string, communityId: string, amount: number): Promise<boolean> {
  if (!Number.isInteger(amount)) throw new Error('Amount has to be an integer')

  return getBalance(agentId, communityId).then(b => {
    if (b !== null) {
      const check = b.balance + b.creditLimit >= amount
      return check
    }
    return false
  })
}

export function hasEnoughFundsToSendMessage (agentId: string, communityId: string): Promise<boolean> {
  return hasEnoughFunds(agentId, communityId, COST_OF_SENDING_MESSAGE)
}

/**
 * UNSAFE!
 * Does not check if there are enough funds
 * Sends money into the community pot from the agent
 * @param agentId
 * @param byAmount should be positive
 */
export async function spend (agentId: string, communityId: string, byAmount: number): Promise<any> {
  assertInt(byAmount)
  assertPositive(byAmount)

  await getBalance(agentId, communityId).then(b => {
    if (b === null) throw new Error('No record of balance for agent ' + agentId)
    const nb = b.balance - byAmount
    return setBalance(agentId, communityId, nb)
  })

  const cb = await getCommunityBalance(communityId)
  return setCommunityBalance(communityId, cb + byAmount)
}

export function getCommunitySharePointsForMessageRating (rating: number) {
  return rating * COST_OF_SENDING_MESSAGE
}
