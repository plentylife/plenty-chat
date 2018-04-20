// @flow

import {
  addCommunitySharePoints,
  getWallet,
  getCommunitySharePoints,
  setBalance,
  _setDemurrageTimestamps
} from '../db/AgentWalletTable'
import {assertPositive, assertInt, assertBetweenZeroOne} from './utils'
import {getCommunityBalance, setCommunityBalance} from '../db/CommunityTable'
import {COST_OF_SENDING_MESSAGE} from './AccountingGlobals'
import type {MessageRow} from '../db/MessageTable'
import {getCommunityOfMsg} from '../db'
import {CommunityIdNotInferrable} from '../utils/Error'
import {getRating} from '../db/RatingTable'

export async function initializeAccount (agentId: string, communityId: string): Promise<boolean> {
  // todo. share points are not intialized; currently they get stuck into db by default.
  const now = new Date().getTime()
  const bs = await setBalance(agentId, communityId, 0)
  const dr = await _setDemurrageTimestamps(agentId, communityId, {
    balance: now, communitySharePoints: now
  })
  return (bs.length > 0 && dr.length > 0)
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

  return getWallet(agentId, communityId).then(b => {
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

  await getWallet(agentId, communityId).then(b => {
    if (b === null) throw new Error('No record of balance for agent ' + agentId)
    const nb = b.balance - byAmount
    return setBalance(agentId, communityId, nb)
  })

  const cb = await getCommunityBalance(communityId)
  console.log('SPEND', cb, byAmount)
  return setCommunityBalance(communityId, cb + byAmount)
}

export function calculateCommunitySharePointsForMessageRating (rating: number) {
  return Math.round(Math.pow(rating, 2) * COST_OF_SENDING_MESSAGE * 100)
}

export async function accountingForMessageRating (message: MessageRow, rating: number): Promise<void> {
  assertBetweenZeroOne(rating) // not quite necessary

  const communityId = await getCommunityOfMsg(message.id)
  if (!communityId) throw new CommunityIdNotInferrable()

  const pointsTotal = calculateCommunitySharePointsForMessageRating(rating)
  const existingRating = await getRating(message.id, message.senderId) // fixme this is a bug // sould be fixed
  const existingPoints = calculateCommunitySharePointsForMessageRating(existingRating) // fixme this is a bug
  let points = pointsTotal
  if (existingPoints !== null) points -= existingPoints

  return addCommunitySharePoints(message.senderId, communityId, points)
}
