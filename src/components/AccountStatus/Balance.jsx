import React, {PureComponent} from 'react'
import AnimateOnChange from 'react-animate-on-change' // ES6
import {TENGE} from '../utils'

class Balance extends PureComponent {
  render () {
    let className = this.props.amount >= 0 ? 'good-standing' : 'warning'
    if (this.props.limit && this.props.amount <= this.props.limit) className = 'danger'
    return <AnimateOnChange
      baseClassName={'balance ' + className}
      animationClassName={'balance-animation'}
      animate={true}
    >{this.props.amount}{TENGE}</AnimateOnChange>
  }
}

export default Balance
