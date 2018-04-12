import {setRating} from '../db/RatingTable'

/**
 * Calculates a rating (can never be 0) and puts it into the database
 * @param {string} userId
 * @param msgId
 * @param {int} rating
 * @param {int} ratingMax
 * @return {Promise} resolves when db finishes setting the rating
 */
export function rateMessage (userId, msgId, rating, ratingMax) {
  if (rating <= 0) throw new Error('rating has to be positive and above 0')
  if (rating > ratingMax) throw new Error('rating cannot be higher than maximum')
  if (ratingMax <= 0) throw new Error('Maximum rating has to be positive')

  const r = rating / ratingMax
  return setRating(userId, msgId, r)
}
