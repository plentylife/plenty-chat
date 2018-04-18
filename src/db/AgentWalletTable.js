// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_MODE} from '../state/GlobalState'
import {COMMUNITY_TABLE} from './CommunityTable'
import {DEFAULT_COMMUNITY_SHARE_POINTS, DEFAULT_CREDIT_LIMIT} from '../accounting/AccountingGlobals'
import {AGENT_TABLE} from './AgentTable'
import {InappropriateAction, MissingDatabaseEntry} from '../utils/Error'
import {assertInt} from '../accounting/utils'

export const AGENT_WALLET_TABLE = 'AgentWallet'

const agentWalletTable = nSQL(AGENT_WALLET_TABLE).model([
  {key: 'id', type: 'uuid', props: ['pk', 'ai']},
  {key: 'agentId', type: AGENT_TABLE, props: ['idx']},
  {key: 'communityId', type: COMMUNITY_TABLE, props: ['idx']},
  {key: 'balance', type: 'int'},
  {key: 'creditLimit', type: 'int'},
  {key: 'communitySharePoints', type: 'number', default: DEFAULT_COMMUNITY_SHARE_POINTS},
  {key: 'demurrageTimestamps', type: 'map'}
]).config({mode: DB_MODE || 'PERM'})

function getRecord (agentId: string, communityId: string): Promise<Array<any>> {
  return nSQL(AGENT_WALLET_TABLE).query('select')
    .where([['agentId', '=', agentId], 'AND', ['communityId', '=', communityId]]).exec()
}

export type DemurrageTimestamps = {
  balance: number, communitySharePoints: number
}
export type Wallet = {
  agentId: string, communityId: string,
  balance: number, creditLimit: number, communitySharePoints: number,
  demurrageTimestamps: DemurrageTimestamps}

export function getWallet (agentId: string, communityId: string): Promise<(Wallet | null)> {
  return getRecord(agentId, communityId).then(r => {
    if (r.length > 0) {
      let b: Wallet = {
        agentId: r[0].agentId,
        communityId: r[0].communityId,
        balance: r[0].balance,
        creditLimit: r[0].creditLimit,
        communitySharePoints: r[0].communitySharePoints,
        demurrageTimestamps: r[0].demurrageTimestamps
      }
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

export function addCommunitySharePoints (agentId: string, communityId: string, pointsToAdd: number): Promise<any> {
  assertInt(pointsToAdd)
  return getRecord(agentId, communityId).then(r => {
    if (r.length !== 1) {
      throw new MissingDatabaseEntry('Could not add community share points to non-existent account', agentId, communityId)
    }
    const newPoints = r[0].communitySharePoints + pointsToAdd
    if (newPoints < 0) throw new InappropriateAction('Community share points cannot be below 0')
    return nSQL(AGENT_WALLET_TABLE).query('upsert', {
      id: r[0].id, communitySharePoints: newPoints
    }).exec()
  })
}

export function _setDemurrageTimestamps (agentId: string, communityId: string, timestamps: DemurrageTimestamps): Promise<any> {
  return getRecord(agentId, communityId).then(r => {
    if (r.length !== 1) {
      throw new MissingDatabaseEntry('Could not add community share points to non-existent account', agentId, communityId)
    }
    const updated = Object.assign({}, r[0].demurrageTimestamps, timestamps)
    return nSQL(AGENT_WALLET_TABLE).query('upsert', {
      id: r[0].id, demurrageTimestamps: updated
    }).exec()
  })
}

export type SharePointsBalance = {
  agentId: string, communitySharePoints: number
}

export function getAllCommunitySharePoints (communityId: string): Promise<Array<SharePointsBalance>> {
  return nSQL(AGENT_WALLET_TABLE).query('select', ['agentId', 'communitySharePoints'])
    .where(['communityId', '=', communityId]).exec()
}

export function getCommunitySharePoints (agentId: string, communityId: string): Promise<number | null> {
  return nSQL(AGENT_WALLET_TABLE).query('select', ['communitySharePoints'])
    .where([['communityId', '=', communityId], 'AND', ['agentId', '=', agentId]]).exec().then(r => {
      return r.length > 0 ? r[0].communitySharePoints : null
    })
}

export function walletExists (agentId: string, communityId: string): Promise<boolean> {
  if (!agentId) throw new TypeError('agentId cannot be null or undefined')
  return getRecord(agentId, communityId).then(r => {
    return r.length > 0
  })
}

export function getAllWallets (): Promise<Array<Wallet>> {
  return nSQL(AGENT_WALLET_TABLE).query('select').exec()
}

export default agentWalletTable
