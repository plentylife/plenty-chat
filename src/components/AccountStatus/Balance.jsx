import React, {PureComponent} from 'react'
import AnimateOnChange from 'react-animate-on-change' // ES6
import {TENGE} from '../utils'
import {floorWithPrecision} from '../../accounting/utils'

type Props = {
  amount: number,
  limit: number
}

class Balance extends PureComponent<Props> {
  render () {
    let amount = floorWithPrecision(this.props.amount, 2)
    let className = this.props.amount >= 0 ? 'good-standing' : 'warning'
    if (this.props.limit && this.props.amount <= this.props.limit) className = 'danger'
    return <AnimateOnChange
      baseClassName={'balance ' + className}
      animationClassName={'balance-animation'}
      animate={true}
    >{amount}{TENGE}</AnimateOnChange>
  }
}

export default Balance
