// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_MODE} from '../state/GlobalState'
import {assertPositive, assertInt} from '../accounting/utils'

export const COMMUNITY_TABLE = 'Community'

const communityTable = nSQL(COMMUNITY_TABLE).model([
  {key: 'communityId', type: 'uuid', props: ['pk']},
  {key: 'balance', type: 'int'}
]).config({mode: DB_MODE || 'PERM'})

/**
 *
 * @param communityId
 * @return the balance or 0 if community does not exist
 */
export function getCommunityBalance (communityId: string): Promise<number> {
  return nSQL(COMMUNITY_TABLE).query('select').where(['communityId', '=', communityId]).exec().then(r => {
    return r.length > 0 ? r[0].balance : 0
  })
}

export function setCommunityBalance (communityId: string, balance: number): Promise<void> {
  assertInt(balance)
  assertPositive(balance, /* zero allowed */ true)
  return nSQL(COMMUNITY_TABLE).query('upsert', {
    communityId, balance
  }).exec()
}

export function communityExists (communityId: string): Promise<boolean> {
  return nSQL(COMMUNITY_TABLE).query('select', ['communityId']).exec().then(r => {
    return r.lenght > 0
  })
}

export default communityTable
