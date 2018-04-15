// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_MODE} from '../state/GlobalState'
import {COMMUNITY_TABLE} from './CommunityTable'
import {DEFAULT_CREDIT_LIMIT} from '../accounting/AccountingGlobals'
import {AGENT_TABLE} from './AgentTable'

export const AGENT_WALLET_TABLE = 'AgentWallet'

const agentWalletTable = nSQL(AGENT_WALLET_TABLE).model([
  {key: 'id', type: 'uuid', props: ['pk', 'ai']},
  {key: 'agentId', type: AGENT_TABLE, props: ['idx']},
  {key: 'communityId', type: COMMUNITY_TABLE, props: ['idx']},
  {key: 'balance', type: 'int'},
  {key: 'creditLimit', type: 'int'}
]).config({mode: DB_MODE || 'PERM'})

function getRecord (agentId: string, communityId: string): Promise<Array<any>> {
  return nSQL(AGENT_WALLET_TABLE).query('select')
    .where([['agentId', '=', agentId], 'AND', ['communityId', '=', communityId]]).exec()
}

export type Wallet = {balance: number, creditLimit: number}

export function getBalance (agentId: string, communityId: string): Promise<(Wallet | null)> {
  return getRecord(agentId, communityId).then(r => {
    if (r.length > 0) {
      let b: Wallet = {balance: r[0].balance, creditLimit: r[0].creditLimit}
      return b
    }
    return null
  })
}

export function setBalance (agentId: string, communityId: string, balance: number): Promise<any> {
  // fixme check that balance is not below credit limit
  if (!Number.isInteger(balance)) throw new Error('Balance has to be an integer')
  let payload = {
    agentId: agentId, communityId: communityId, balance: balance
  }
  return getRecord(agentId, communityId).then(r => {
    if (r.length > 0) {
      // $FlowFixMe
      payload.id = r[0].id
    } else {
      // $FlowFixMe
      payload.creditLimit = DEFAULT_CREDIT_LIMIT // fixme should not be here
    }
    console.log('Setting new balance for [agent] in [community] to [amount]', agentId, communityId, balance)
    return nSQL(AGENT_WALLET_TABLE).query('upsert', payload).exec()
  })
}

export function walletExists (agentId: string, communityId: string): Promise<boolean> {
  if (!agentId) throw new TypeError('agentId cannot be null or undefined')
  return getRecord(agentId, communityId).then(r => {
    return r.length > 0
  })
}

export default agentWalletTable
