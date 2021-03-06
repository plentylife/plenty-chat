// @flow

import React from 'react'
import '../utils.css'
import './star.css'

type Props = {
  index: number,
  isFilled: boolean,
  onClick: () => void,
  onSelect: (number) => void,
  onUnselect: () => void,
}

export default class Star extends React.PureComponent<Props> {
  render () {
    return <div onClick={this.props.onClick} className={'star-container'} onMouseOver={() => {
      this.props.onSelect(this.props.index)
    }} onMouseOut={this.props.onUnselect}>
      <span className={(this.props.isFilled ? 'hidden' : '')}><i className={'far fa-star'}/></span>
      <span className={(this.props.isFilled ? '' : 'hidden') }><i className={'fas fa-star'}/></span>
    </div>
  }
}
