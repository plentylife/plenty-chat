import {nSQLiteAdapter} from 'nano-sqlite'

let _currentAgentId = 'anton'
export var currentCommunityId = 'commid'

export const DB_MODE = (() => {
  switch (process.env.NODE_ENV) {
    case 'production':
      // eslint-disable-next-line new-cap
      if (process.env.DB_NAME) return new nSQLiteAdapter(process.env.DB_NAME)
      return 'PERM'
    case 'testperm':
      // import('nano-sqlite').then(nsqlite => {
      // import {nSQLiteAdapter} from 'nano-sqlite'
      // eslint-disable-next-line new-cap
      return new nSQLiteAdapter(process.env.DB_NAME || './db-plenty.sqlite3')
      // })
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
