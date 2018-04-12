import {STUB} from '../utils'
import {getBalance} from '../db/UserWalletTable'

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
 * Sends money into the community pot
 * @param userId
 * @param amount
 */
export function spend (userId, amount) {
  STUB()
}
