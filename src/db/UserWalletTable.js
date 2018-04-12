// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_MODE} from '../state/GlobalState'
import {COMMUNITY_TABLE} from './CommunityTable'
import {DEFAULT_CREDIT_LIMIT} from '../accounting/AccountingGlobals'

export const USER_WALLET_TABLE = 'UserWallet'

const userWalletTable = nSQL(USER_WALLET_TABLE).model([
  {key: 'id', type: 'uuid', props: ['pk', 'ai']},
  {key: 'userId', type: 'string', props: ['idx']},
  {key: 'communityId', type: COMMUNITY_TABLE, props: ['idx']},
  {key: 'balance', type: 'int'},
  {key: 'creditLimit', type: 'int'}
]).config({mode: DB_MODE || 'PERM'})

function getRecord (userId: string, communityId: string): Promise<Array<any>> {
  return nSQL(USER_WALLET_TABLE).query('select')
    .where([['userId', '=', userId], 'AND', ['communityId', '=', communityId]]).exec()
}

export type Balance = {balance: number, creditLimit: number}

export function getBalance (userId: string, communityId: string): Promise<(Balance | null)> {
  return getRecord(userId, communityId).then(r => {
    if (r.length > 0) {
      let b: Balance = {balance: r[0].balance, creditLimit: r[0].creditLimit}
      return b
    }
    return null
  })
}

export function setBalance (userId: string, communityId: string, balance: number): Promise<any> {
  // fixme check that balance is not below credit limit
  if (!Number.isInteger(balance)) throw new Error('Balance has to be an integer')
  let payload = {
    userId: userId, communityId: communityId, balance: balance
  }
  return getRecord(userId, communityId).then(r => {
    if (r.length > 0) {
      // $FlowFixMe
      payload.id = r[0].id
    } else {
      // $FlowFixMe
      payload.creditLimit = DEFAULT_CREDIT_LIMIT
    }
    return nSQL(USER_WALLET_TABLE).query('upsert', payload).exec()
  })
}

export default userWalletTable
