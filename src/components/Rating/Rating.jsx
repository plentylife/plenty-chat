import React, {PureComponent} from 'react'
import {getRating, RATING_TABLE} from '../../db/RatingTable'
// import {RATING_TABLE} from '../../db/RatingTable'
import Star from './Star'
import './rating.css'

class Rating extends PureComponent {
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
    return (this.props.nSQLdata !== null || this.props.nSQLdata !== undefined) ? Rating.calcSelectedStars(this.props.nSQLdata, this.props.numStars) : 0
  }

  static calcSelectedStars (rating, numStars) {
    console.log('calcSelectedStars', rating, numStars)
    return Math.ceil(rating * (numStars - 1) + 1)
  }

  static tables () {
    return [RATING_TABLE] // listen for changes on this table
  }

  static onChange (event, complete) {
    if (event.affectedRows.length > 0) {
      console.log('message rating change event', event)
    }

    getRating(this.props.messageId, this.props.agentId).then(rating => {
      console.log('got rating', rating)
      complete(rating)
    })
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    console.log('rating comp deriving new props', nextProps)
    if (nextProps.nSQLdata !== null || nextProps.nSQLdata !== undefined) {
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
    this.setState({
      starsSelected: this.starsSelected()
    })
  }

  render () {
    console.log('stars selected', this.state.starsSelected, this.props.nSQLdata)
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
