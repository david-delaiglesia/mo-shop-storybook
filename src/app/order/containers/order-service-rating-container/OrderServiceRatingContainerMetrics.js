import { PureComponent } from 'react'

import { func } from 'prop-types'

import { eventTypes } from 'wrappers/metrics'

class OrderServiceRatingContainerMetrics extends PureComponent {
  constructor() {
    super()

    this.metricsEvents = {
      rate: this.rate.bind(this),
    }
  }

  rate() {
    const { trackInteraction, rate } = this.props

    trackInteraction(eventTypes.SERVICE_RATING_DETAIL_ORDER_BUTTON_CLICK)
    rate()
  }

  render() {
    return this.props.children(this.metricsEvents)
  }
}

OrderServiceRatingContainerMetrics.propTypes = {
  children: func.isRequired,
  trackInteraction: func.isRequired,
  rate: func.isRequired,
}

export default OrderServiceRatingContainerMetrics
