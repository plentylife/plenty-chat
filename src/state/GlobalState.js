// @flow

import {nSQLiteAdapter} from 'nano-sqlite'

let _currentAgentId = null
let _currentCommunityId = null
let _sendTableSync = false
let _sendEventSync = false

export const PLENTY_VERSION = 180504

export const DB_ID = PLENTY_VERSION.toString()

/** time between demurrage and community pot splits; in minutes */
export const CRON_TIME = 10

export var DB_MODE = (() => {
  // eslint-disable-next-line new-cap
  if (process.env.DB_NAME) return new nSQLiteAdapter(process.env.DB_NAME)

  switch (process.env.NODE_ENV) {
    case 'production':
      return 'PERM'
    default:
      return process.env.DB_MODE || 'TEMP'
  }
})()

export function setDbMode (mode: any) {
  DB_MODE = mode
}

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

export function setSendTableSync (v: boolean) {
  _sendTableSync = v
}

export function getSendTableSync (v: boolean) {
  return _sendTableSync
}

export function setSendEventSync (v: boolean) {
  _sendEventSync = v
}

export function getSendEventSync (v: boolean) {
  return _sendEventSync
}

