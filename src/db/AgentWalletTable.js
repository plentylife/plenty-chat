// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_ID, DB_MODE} from '../state/GlobalState'
import {COMMUNITY_TABLE} from './CommunityTable'
import {DEFAULT_COMMUNITY_SHARE_POINTS, DEFAULT_CREDIT_LIMIT} from '../accounting/AccountingGlobals'
import {AGENT_TABLE} from './AgentTable'
import {InappropriateAction, MissingDatabaseEntry} from '../utils/Error'
import {assertInt} from '../accounting/utils'
import {hasEnoughFundsNum} from '../accounting/Accounting'
import {Decimal} from 'decimal.js'
import {rowOrNull} from './index'

export const AGENT_WALLET_TABLE = 'AgentWallet'

const agentWalletTable = nSQL(AGENT_WALLET_TABLE).model([
  {key: 'id', type: 'string', props: ['pk']},
  {key: 'agentId', type: AGENT_TABLE, props: ['idx']},
  {key: 'communityId', type: COMMUNITY_TABLE, props: ['idx']},
  {key: 'balance', type: 'number'},
  {key: 'creditLimit', type: 'number'},
  {key: 'communitySharePoints', type: 'number'},
  // {key: 'communitySharePoints', type: 'number', default: DEFAULT_COMMUNITY_SHARE_POINTS},
  {key: 'demurrageTimestamps', type: 'map'},
  {key: 'incomingStat', type: 'number', default: 0},
  {key: 'outgoingStat', type: 'number', default: 0}
]).config({mode: DB_MODE || 'PERM', id: DB_ID})

function getRecord (agentId: string, communityId: string): Promise<Array<any>> {
  return nSQL(AGENT_WALLET_TABLE).query('select')
    .where([['agentId', '=', agentId], 'AND', ['communityId', '=', communityId]]).exec()
}

export const WALLET_DEMURRAGE_PROPERTIES = ['balance', 'communitySharePoints', 'creditLimit', 'incomingStat', 'outgoingStat']
export type DemurrageTimestamps = {
  balance: number, communitySharePoints: number
}
export type Wallet = {
  agentId: string, communityId: string,
  balance: number, creditLimit: number, communitySharePoints: number,
  demurrageTimestamps: DemurrageTimestamps, incomingStat: number, outgoingStat: number}

export function getWallet (agentId: string, communityId: string): Promise<(Wallet | null)> {
  if (!communityId) throw new TypeError(`Cannot retrieve wallet without community id for agent ${agentId}`)
  return getRecord(agentId, communityId).then(r => {
    if (r.length > 0) {
      let b: Wallet = {
        agentId: r[0].agentId,
        communityId: r[0].communityId,
        balance: r[0].balance,
        creditLimit: r[0].creditLimit,
        communitySharePoints: r[0].communitySharePoints,
        demurrageTimestamps: r[0].demurrageTimestamps,
        incomingStat: r[0].incomingStat,
        outgoingStat: r[0].outgoingStat
      }
      return b
    }
    return null
  })
}

function generateRowId (agentId: string, communityId: string) {
  return agentId + '-' + communityId
}

export function adjustBalance (agentId: string, communityId: string, balance: number): Promise<any> {
  return setBalance(agentId, communityId, balance, /* isDelta */true)
}

/** @param isDelta signifies that the balance should be treated as a delta, thus a wallet needs to exist
 * if it is a delta, the outgoing and incoming stats are updated */
export function setBalance (agentId: string, communityId: string, balance: number, isDelta = false): Promise<any> {
  /** Setting new balance for  an agent */
  const dBalance = Decimal(balance)
  let payload = {
    agentId: agentId, communityId: communityId
  }
  return getRecord(agentId, communityId).then(r => {
    if (isDelta && r.length === 0) {
      throw new MissingDatabaseEntry('to adjust a wallet balance by a delta, the wallet must exist. ' +
        `agent id [${agentId}]; community id [${communityId}]`)
    }
    if (isDelta) {
      payload.balance = dBalance.plus(Decimal(r[0].balance)).toNumber()
      if (dBalance.lt(0)) {
        payload.outgoingStat = Decimal(r[0].outgoingStat).plus(dBalance.abs())
      } else if (dBalance.gt(0)) {
        payload.incomingStat = Decimal(r[0].incomingStat).plus(dBalance.abs())
      }
    } else {
      payload.balance = dBalance.toNumber()
    }
    if (r.length > 0) {
      // $FlowFixMe
      payload.id = r[0].id
      if (r[0].balance <= 0 && dBalance.gt(0)) {
        payload.demurrageTimestamps = Object.assign({}, r[0].demurrageTimestamps, {balance: (new Date().getTime())})
      }
    } else {
      payload.id = generateRowId(agentId, communityId)
      // $FlowFixMe
      payload.creditLimit = DEFAULT_CREDIT_LIMIT // fixme should not be here
      payload.communitySharePoints = DEFAULT_COMMUNITY_SHARE_POINTS
    }
    console.log(`Setting new balance for ${agentId} in ${communityId} to ${payload.balance}` + (isDelta ? ` ${balance}` : ''))
    return nSQL(AGENT_WALLET_TABLE).query('upsert', payload).exec()
  })
}

export function addCommunitySharePoints (agentId: string, communityId: string, pointsToAdd: number): Promise<any> {
  assertInt(pointsToAdd)
  return getRecord(agentId, communityId).then(r => {
    if (r.length !== 1) {
      throw new MissingDatabaseEntry('Could not add community share points to non-existent account (or too many accounts)', agentId, communityId)
    }
    const newPoints = r[0].communitySharePoints + pointsToAdd
    if (newPoints < 0) throw new InappropriateAction('Community share points cannot be below 0')
    let upsert = {
      id: r[0].id, communitySharePoints: newPoints
    }

    if (r[0].communitySharePoints === 0 && pointsToAdd > 0) {
      upsert.demurrageTimestamps = Object.assign({}, r[0].demurrageTimestamps,
        {communitySharePoints: (new Date().getTime())}
      )
    }

    return nSQL(AGENT_WALLET_TABLE).query('upsert', upsert).exec()
  })
}

export function applyDemurrageToWallet (agentId: string, communityId: string, delta: Object): Promise<Array<any>> {
  return getRecord(agentId, communityId).then(r => {
    if (r.length !== 1) {
      return nSQL('Event').query('select').where([['eventType', '=', 'addAgentToCommunity'], 'AND', ['senderId', '=', 'up1g6iyezbdw9ptby8ts4hrs9w']]).exec().then(ch => {
      // nSQL('Event').query('select').where([['eventType', '=', 'addAgentToCommunity'], 'AND', ['senderId', '=', 'jdjr9bpehtgs3pokkas8n7dr8e']]).exec().then(ch => {
        console.log(ch)
        throw new MissingDatabaseEntry('Could not add community share points to non-existent account', agentId, communityId)
      })
    }
    const now = new Date().getTime()
    let flagAny = false
    const newBalances = {}
    const timestamps: DemurrageTimestamps = Object.assign({}, r[0].demurrageTimestamps)

    WALLET_DEMURRAGE_PROPERTIES.forEach(prop => {
      if (delta[prop]) {
        const cb = Decimal(r[0][prop])
        newBalances[prop] = cb.minus(delta[prop])
        timestamps[prop] = now
        flagAny = true
      }
    })

    if (flagAny) {
      newBalances.outgoingStat = (newBalances.outgoingStat || Decimal(r[0].outgoingStat)).plus(delta.balance)
      const upsert = Object.assign({id: r[0].id}, newBalances, {demurrageTimestamps: timestamps})
      return nSQL(AGENT_WALLET_TABLE).query('upsert', upsert).exec()
    } else {
      return []
    }
  })
}

export function _setDemurrageTimestamps (agentId: string, communityId: string,
  timestamps: DemurrageTimestamps): Promise<any> {
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

export function getWalletsInCommunity (communityId: string): Promise<Array<Wallet>> {
  return nSQL(AGENT_WALLET_TABLE).query('select').where(['communityId', '=', communityId]).exec()
}

export function getWalletsNearLimit (communityId: string, closeBy: number): Promise<Array<Wallet>> {
  return getWalletsInCommunity(communityId).then(ws => {
    return ws.filter(w => {
      return !hasEnoughFundsNum(w.balance, w.creditLimit, closeBy)
    })
  })
}

export function setCreditLimit (agentId: string, communityId: string, creditLimit: Decimal): Promise<null | Object> {
  const id = generateRowId(agentId, communityId)
  return nSQL(AGENT_WALLET_TABLE).query('upsert', {
    id, creditLimit: creditLimit.toNumber()
  }).exec().then(rowOrNull)
}

export default agentWalletTable
