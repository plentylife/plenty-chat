import DW from './DonationWindow'
import {bindNSQL} from 'nano-sql-react'
import type {Wallet} from '../../db/AgentWalletTable'
import {COST_OF_SENDING_MESSAGE} from '../../accounting/AccountingGlobals'
import {getWalletsNearLimit} from '../../db/index'
import {getCurrentAgentId, getCurrentCommunityId} from '../../state/GlobalState'
import {getLastEventBy} from '../../db/EventTable'

export function getWalletsForDonation () {
  return getWalletsNearLimit(getCurrentCommunityId(), COST_OF_SENDING_MESSAGE).then(async ws => {
    const sansSelf = ws.filter((w: Wallet) => {
      return w.agentId !== getCurrentAgentId()
    })
    return sortWallets(sansSelf)
  })
}

async function sortWallets (wallets: Array<Wallet>): Promise<Array<Wallet>> {
  const withLastTimestamp = []
  const ps = wallets.map(w => {
    return getLastEventBy(w.agentId, w.communityId).then(e => {
      withLastTimestamp.push([e.timestamp, w])
    })
  })
  await Promise.all(ps)
  return withLastTimestamp.sort((a, b) => {
    return b[0] - a[0]
  }).map(wt => (wt[1]))
}

const DonationWindow = bindNSQL(DW)

export {
  DonationWindow
}
