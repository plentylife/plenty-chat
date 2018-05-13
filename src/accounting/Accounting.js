// @flow

import {
  addCommunitySharePoints,
  getWallet,
  setBalance,
  _setDemurrageTimestamps, getWalletsInCommunity, setCreditLimit, adjustBalance
} from '../db/AgentWalletTable'
import {
  assertPositive,
  assertInt,
  assertBetweenZeroOne,
  assertNumber,
  floorWithPrecision
} from './utils'
import {getCommunityBalance, setCommunityBalance} from '../db/CommunityTable'
import {COST_OF_SENDING_MESSAGE, MAX_PRECISION_IN_AGENT_AMOUNTS} from './AccountingGlobals'
import {getCommunityOfMsg} from '../db'
import {CommunityIdNotInferrable} from '../utils/Error'
import {getRating} from '../db/RatingTable'
import {AMOUNT_UNDER_ZERO} from '../utils/UserErrors'
import './required'
import {Decimal} from 'decimal.js'
import {calculateCreditLimitDelta} from './CreditLimit'
import {generateDemurrageTimestamps} from './Demurrage'

export async function initializeAccount (agentId: string, communityId: string): Promise<boolean> {
  // todo. share points are not intialized; currently they get stuck into db by default.
  const now = new Date().getTime()
  const bs = await setBalance(agentId, communityId, 0)
  const dr = await _setDemurrageTimestamps(agentId, communityId, generateDemurrageTimestamps(now))
  return (bs.length > 0 && dr.length > 0)
}

export function initializeCommunity (communityId: string): Promise<void> {
  return setCommunityBalance(communityId, 0).then(r =>
    (r.length > 0)
  )
}

export function hasEnoughFundsNum (balance, creditLimit, amountRequested): boolean {
  return (balance + creditLimit - amountRequested > 0)
}

/**
 * Checks if the agent has enough funds according to the point of view of this agent
 *
 * @param agentId
 * @param communityId
 * @param {int} amount has to be an integer
 */
export function hasEnoughFunds (agentId: string, communityId: string, amount: number): Promise<boolean> {
  // if (!Number.isInteger(amount)) throw new Error('Amount has to be an integer')
  assertNumber(amount)

  return getWallet(agentId, communityId).then(b => {
    if (b !== null) {
      const check = Decimal(b.balance).plus(Decimal(b.creditLimit)).gte(amount)
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
    const amount = Decimal(byAmount).neg()
    return adjustBalance(agentId, communityId, amount.toNumber())
  })

  const cb = await getCommunityBalance(communityId)
  return setCommunityBalance(communityId, Decimal(cb).plus(byAmount).toNumber())
}

export function calculateCommunitySharePointsForMessageRating (rating: number) {
  return Math.round(Math.pow(rating, 2) * COST_OF_SENDING_MESSAGE * 100)
}

export async function accountingForMessageRating (messageId: string, msgSenderId: string, ratingAgentId, rating: number,
  _communityId: string = null): Promise<void> {
  assertBetweenZeroOne(rating) // not quite necessary

  let communityId = _communityId
  if (!communityId) communityId = await getCommunityOfMsg(messageId)
  if (!communityId) throw new CommunityIdNotInferrable()

  const pointsTotal = calculateCommunitySharePointsForMessageRating(rating)
  const existingRating = await getRating(messageId, ratingAgentId) // fixme it's the rater that we need, not the the sender
  const existingPoints = existingRating !== null ? calculateCommunitySharePointsForMessageRating(existingRating) : 0
  let points = pointsTotal
  if (existingPoints !== null) points -= existingPoints

  return addCommunitySharePoints(msgSenderId, communityId, points)
}

export function convertStringToValidAmount (str: string): {amount: ?Decimal, error: ?string} {
  try {
    const number = Decimal(str)
    if (number.isNaN()) {
      return {error: 'this is not a number', amount: null}
    } else {
      try {
        const amount = validateAndFormatTransactionAmount(number)
        return {amount, error: null}
      } catch (e) {
        if (e instanceof RangeError) {
          return {amount: number, error: AMOUNT_UNDER_ZERO}
        }
        return {amount: null, error: 'unknown error. whoops...'}
      }
    }
  } catch (e) {
    return {amount: null, error: 'this is not a number'}
  }
}

export function validateAndFormatTransactionAmount (_amount: number): Decimal {
  const amount = floorWithPrecision(_amount, MAX_PRECISION_IN_AGENT_AMOUNTS)
  assertPositive(amount)
  return amount
}

export async function updateCreditLimit (agentId: string, communityId: string, incomingAmount: Decimal): Promise<boolean> {
  const wallet = await getWallet(agentId, communityId)
  let communityMembersCount = (await getWalletsInCommunity(communityId)).length
  const delta = calculateCreditLimitDelta(Decimal(wallet.creditLimit), communityMembersCount, incomingAmount)
  const updatedLimit = delta.plus(wallet.creditLimit)
  return setCreditLimit(agentId, communityId, updatedLimit).then(r => !!r)
}
