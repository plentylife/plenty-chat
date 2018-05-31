// @flow
import {nSQL} from 'nano-sql/lib/index'
import {DB_ID, DB_MODE} from '../state/GlobalState'

export const RATING_TABLE = 'Rating'

const ratingTable = nSQL(RATING_TABLE).model([
  {key: 'id', type: 'int', props: ['pk', 'ai']},
  {key: 'agentId', type: 'string', props: ['idx']},
  {key: 'messageId', type: 'string', props: ['idx']},
  {key: 'rating', type: 'float'}
]).config({mode: DB_MODE || 'PERM', id: DB_ID, cache: false})

function getRatingQuery (agentId: string, messageId: string) {
  return nSQL(RATING_TABLE).query('select', ['id', 'rating'])
    .where([['agentId', '=', agentId], 'AND', ['messageId', '=', messageId]]).exec()
}

export function getRating (messageId: string, agentId: string): Promise<number | null> {
  return getRatingQuery(agentId, messageId).then(row => {
    return row.length > 0 ? row[0].rating : null
  })
}

export function setRating (messageId: string, agentId: string, rating: number) {
  let payload = {
    agentId: agentId, messageId: messageId, rating: rating
  }

  return getRatingQuery(agentId, messageId).then(row => {
    if (row.length > 0) {
      // $FlowFixMe
      payload.id = row[0].id
    }
  }).then(() => {
    return nSQL(RATING_TABLE).query('upsert', payload).exec()
  })
}

export default ratingTable
