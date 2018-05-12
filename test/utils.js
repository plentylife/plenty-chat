// @flow

import {DB_MODE} from '../src/state/GlobalState'
import {nSQL} from 'nano-sql/lib/index'
import {ALL_TABLES} from '../src/db'

export function setupDb (t) {
  console.log('Setting up')
  t.is(DB_MODE, 'TEMP')
  console.log('Table mode is TEMP')
  return nSQL().connect().then(() => {
    return dropAll().then(() => console.log('Dropped all tables'))
  })
}

export function _dropDb (name: string) {
  console.log('Dropping', name)
  return nSQL(name).query('drop').exec()
}

export function dropAll (skipTables: Array<string> = []) {
  return new Promise(resolve => {
    let left = ALL_TABLES.length
    ALL_TABLES.forEach(async t => {
      if (!skipTables.includes(t)) {
        await _dropDb(t)
      }
      left -= 1
      if (left === 0) resolve()
    })
  })
}

export function applyToAllDbs (f: (any) => Promise<void>) {
  return new Promise(resolve => {
    let left = ALL_TABLES.length
    ALL_TABLES.forEach(async t => {
      const table = nSQL(t)
      await f(table)
      left -= 1
      if (left === 0) resolve()
    })
  })
}

export function waitAndCheck (condition: () => boolean) {
  const p = new Promise(resolve => {
    let lastCheck = false
    setInterval(() => {
      console.log('waitAndCheck', condition())
      if (lastCheck) {
        if (condition()) {
          resolve()
        } else {
          lastCheck = false
        }
      }

      if (condition()) {
        lastCheck = true
      }
    }, 500)
  })
  return p
}
