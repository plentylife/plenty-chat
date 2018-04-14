import {nSQLiteAdapter} from 'nano-sqlite'

export var currentAgentId = 'anton'
export var currentCommunityId = 'commid'

export const DB_MODE = (() => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return 'PERM'
    case 'testperm':
      // eslint-disable-next-line new-cap
      return new nSQLiteAdapter('./db-plenty.sqlite3')
    default:
      return 'TEMP'
  }
})()
