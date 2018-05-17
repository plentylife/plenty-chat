// @flow

import {nSQL} from 'nano-sql/lib/index'
import {DB_ID, DB_MODE} from '../state/GlobalState'
import {rowOrNull} from './utils'
import {SETTINGS_TABLE} from './tableNames'

const settingsTable = nSQL(SETTINGS_TABLE).model([
  {key: 'key', type: 'string', props: ['pk']},
  {key: '*', type: '*'}
]).config({mode: DB_MODE || 'PERM', id: DB_ID})

export function pushSimpleSetting (key: string, value: any): Promise<any | null> {
  return nSQL(SETTINGS_TABLE).query('upsert', {
    key, value
  }).exec().then(rowOrNull)
}

export function getSetting (key: string): Promise<any> {
  return nSQL(SETTINGS_TABLE).query('select').where(['key', '=', key]).exec().then(rowOrNull)
}

export function getBooleanSetting (key: string): Promise<boolean> {
  return getSetting(key).then(o => (o && !!o.value))
}

export default settingsTable
