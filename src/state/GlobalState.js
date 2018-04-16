import {nSQLiteAdapter} from 'nano-sqlite'

let _currentAgentId = 'anton'
export var currentCommunityId = 'commid'

export const DB_MODE = (() => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'PERM'
    case 'testperm':
      // eslint-disable-next-line new-cap
      return new nSQLiteAdapter(process.env.DB_NAME || './db-plenty.sqlite3')
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
