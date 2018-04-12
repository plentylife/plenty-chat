// @flow

import {getBalance, setBalance} from '../db/UserWalletTable'
import {assertAboveZero, assertInt} from './utils'

/**
 * Checks if the user has enough funds according to the point of view of this agent
 *
 * @param userId
 * @param communityId
 * @param {int} amount has to be an integer
 */
export function hasEnoughFunds (userId, communityId, amount): Promise<boolean> {
  if (!Number.isInteger(amount)) throw new Error('Amount has to be an integer')

  return getBalance(userId, communityId).then(b => {
    if (b !== null) {
      const check = b.balance + b.creditLimit >= amount
      return check
    }
    return false
  })
}

/**
 * UNSAFE!
 * Does not check if there are enough funds
 * Sends money into the community pot
 * @param userId
 * @param byAmount should be positive
 */
export function spend (userId: string, communityId: string, byAmount: number): Promise<any> {
  assertInt(byAmount)
  assertAboveZero(byAmount)
  return getBalance(userId, communityId).then(b => {
    const nb = b.balance - byAmount
    return setBalance(userId, communityId, nb)
  })
}
