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

function dropDb (name: string) {
  console.log('Dropping', name)
  return nSQL(name).query('drop').exec()
}

function dropAll () {
  return new Promise(resolve => {
    let left = ALL_TABLES.length
    ALL_TABLES.forEach(t => {
      dropDb(t).then(() => {
        left -= 1
        if (left === 0) resolve()
      })
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
