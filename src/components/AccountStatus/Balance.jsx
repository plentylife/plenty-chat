import React from 'react'
import {TENGE} from '../utils'

const Balance = (props) => {
  let className = props.amount >= 0 ? 'good-standing' : 'warning'
  if (props.limit && props.amount <= props.limit) className = 'danger'
  return <span className={'balance ' + className}>{props.amount}{TENGE}</span>
}

export default Balance
