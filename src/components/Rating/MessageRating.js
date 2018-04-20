// @flow
import Rating from './Rating'
import React from 'react'
import {bindNSQL} from 'nano-sql-react/index'
import {rateMessage} from '../../actions/RatingActions'

type Props = {
  agentId: string,
  messageId: string
}

const NUM_STARS = 3

function onRating (index, agentId, messageId) {
  console.log('Selected rating index', index, agentId, messageId)
  return rateMessage(messageId, agentId, index, NUM_STARS)
}

const RatingSql = bindNSQL(Rating)

export default function MessageRating (props: Props) {
  return <RatingSql {...props} onRating={onRating} numStars={NUM_STARS}/>
}
