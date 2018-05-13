import React, {PureComponent} from 'react'
import AnimateOnChange from 'react-animate-on-change' // ES6
import {AMOUNT_PRECISION_IN_DISPLAY, TENGE} from '../utils'
import {floorWithPrecisionPrimitive} from '../../accounting/utils'

type Props = {
  amount: number,
  limit: number,
  spellThanks: ?boolean
}

class Balance extends PureComponent<Props> {
  render () {
    let thanks = TENGE
    if (this.props.spellThanks) thanks = ' ' + thanks + 'hanks'
    let amount = floorWithPrecisionPrimitive(this.props.amount, AMOUNT_PRECISION_IN_DISPLAY)
    let className = this.props.amount >= 0 ? 'good-standing' : 'warning'
    if (this.props.limit && this.props.amount <= this.props.limit) className = 'danger'
    return <AnimateOnChange
      baseClassName={'balance ' + className}
      animationClassName={'balance-animation'}
      animate={true}
    >{amount}{thanks}</AnimateOnChange>
  }
}

export default Balance
