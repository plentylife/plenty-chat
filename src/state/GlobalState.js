// import {nSQLiteAdapter} from 'nano-sqlite'

let _currentAgentId = 'anton'
let _currentCommunityId = 'commid'

/** time between demurrage and community pot splits; in minutes */
export const CRON_TIME = 10

export const DB_MODE = (() => {
  switch (process.env.NODE_ENV) {
    case 'production':
      // eslint-disable-next-line new-cap
      // if (process.env.DB_NAME) return new nSQLiteAdapter(process.env.DB_NAME)

      // return 'PERM'
      // return 'IDB_WW'
      // return 'IDB'
      // return 'WSQL'
      return 'LS'
    case 'testperm':
      // eslint-disable-next-line new-cap

      // return new nSQLiteAdapter(process.env.DB_NAME || './db-plenty.sqlite3')
      return null

    default:
      return 'IDB'
      // return 'TEMP'
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
