import {nSQL} from 'nano-sql/lib/index'
import {DB_MODE} from '../state/GlobalState'

export const RATING_TABLE = 'Rating'

const ratingTable = nSQL(RATING_TABLE).model([
  {key: 'id', type: 'int', props: ['pk', 'ai']},
  {key: 'userId', type: 'string', props: ['idx']},
  {key: 'messageId', type: 'string', props: ['idx']},
  {key: 'rating', type: 'float'}
]).config({mode: DB_MODE || 'PERM'})

export function getRating (userId, messageId) {
  return ratingTable.query('select', ['rating'])
    .where([['userId', '=', userId], 'AND', ['messageId', '=', messageId]]).exec()
}

export default ratingTable
