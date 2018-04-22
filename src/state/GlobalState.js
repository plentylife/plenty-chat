import {nSQLiteAdapter} from 'nano-sqlite'

let _currentAgentId = 'anton'
let _currentCommunityId = 'commid'

/** time between demurrage and community pot splits; in minutes */
export const CRON_TIME = 10

export const DB_MODE = (() => {
  // eslint-disable-next-line new-cap
  if (process.env.DB_NAME) return new nSQLiteAdapter(process.env.DB_NAME)

  switch (process.env.NODE_ENV) {
    case 'production':
      return 'LS'
    default:
      return 'TEMP'
  }
})()

export function getCurrentAgentId (): string {
  return _currentAgentId
}

export function setCurrentAgentId (id: string) {
  console.log('Global (current) Agent ID is set to', id)
  _currentAgentId = id
}

export function setCurrentCommunityId (id: string) {
  console.log('Global (current) Community ID is set to', id)
  _currentCommunityId = id
}

export function getCurrentCommunityId (): string {
  return _currentCommunityId
}
