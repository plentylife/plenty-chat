import React, {PureComponent} from 'react'
import {getRating, RATING_TABLE} from '../../db/RatingTable'
import Star from './Star'
import './rating.css'

type Props = {
  nSQLdata: (null | number),
  numStars: number,
  agentId: string,
  messageId: string,
  onRating: (number, string, string) => void
}

class Rating extends PureComponent<Props> {
  constructor (props) {
    super(props)
    this.state = {
      starsSelected: this.starsSelected()
    }
    this.starsSelected = ::this.starsSelected
    this.onStarsPreSelect = ::this.onStarsPreSelect
    this.unselectStars = ::this.unselectStars
    this.onStarClick = ::this.onStarClick
  }

  starsSelected () {
    // console.log('Rating starts selected', this.props.nSQLdata)
    return (this.props.nSQLdata !== null && this.props.nSQLdata !== undefined) ? Rating.calcSelectedStars(this.props.nSQLdata, this.props.numStars) : 0
  }

  static calcSelectedStars (rating, numStars) {
    // console.log('CalcSelectedStars', rating, numStars)
    return Math.ceil(rating * (numStars - 1) + 1)
  }

  static tables () {
    return [RATING_TABLE] // listen for changes on this table
  }

  static onChange (event, complete) {
    // console.log('Rating onChange (event)', event)
    if (event.affectedRows.length > 0) {
      const r = event.affectedRows[0]
      if (r.messageId === this.props.messageId && r.agentId === this.props.agentId) {
        // console.log('Rating onChange (parse event)', r.rating)
        complete(r.rating)
      }
    } else if (event.notes.length > 0 || event.notes[0] === 'mount') {
      getRating(this.props.messageId, this.props.agentId).then(r => {
        // console.log('Rating onChange (mount)', r)
        complete(r)
      })
    }
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    // console.log('Rating GDS', nextProps)
    if (nextProps.nSQLdata !== null && nextProps.nSQLdata !== undefined) {
      // console.log('Rating getDerivedState', nextProps.nSQLdata)
      return {
        starsSelected: Rating.calcSelectedStars(nextProps.nSQLdata, nextProps.numStars)
      }
    }
    return null
  }

  onStarClick (index) {
    return () => {
      this.props.onRating(index, this.props.agentId, this.props.messageId)
    }
  }

  onStarsPreSelect (index) {
    this.setState({
      starsSelected: index + 1
    })
  }

  unselectStars () {
    // console.log('unselect stars')
    this.setState({
      starsSelected: this.starsSelected()
    })
  }

  render () {
    // console.log('Rating render', this.state.starsSelected)
    return <div className={'rating-container'}>
      {Array.from(Array(this.props.numStars).keys()).map(index => {
        let isFilled = this.state.starsSelected >= index + 1
        return <Star key={index} isFilled={isFilled} onClick={this.onStarClick(index)}
          onSelect={this.onStarsPreSelect} onUnselect={this.unselectStars} index={index}
        />
      })}
    </div>
  }
}

export default Rating
