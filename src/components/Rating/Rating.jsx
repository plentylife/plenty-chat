import React, {PureComponent} from 'react'
import {getRating, RATING_TABLE} from '../../db/RatingTable';

class Rating extends PureComponent {
  static tables () {
    return [RATING_TABLE] // listen for changes on this table
  }

  static onChange (event, complete) {
    console.log('message rating change event', event)

    getRating(this.props.userId, this.props.messageId).then(rows => {
      if (rows.length > 0) {
        complete(rows[0].rating)
      } else {
        complete(0)
      }
    })
  }

  render () {
    return <div>
      Rating {this.props.nSQLdata}
    </div>
  }
}

export default Rating
