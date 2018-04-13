// @flow
import Rating from './Rating'
import React from 'react'
import {bindNSQL} from 'nano-sql-react/index'

type Props = {
  agentId: string,
  messageId: string
}

function onRating (index) {
  console.log('Selected rating index', index)
}

const RatingSql = bindNSQL(Rating)

export default function MessageRating (props: Props) {
  return <RatingSql {...props} onRating={onRating} numStars={3}/>
}
