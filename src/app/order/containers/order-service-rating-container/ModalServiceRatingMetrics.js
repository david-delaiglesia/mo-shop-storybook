import { PureComponent } from 'react'

import { func } from 'prop-types'

import { eventTypes } from 'wrappers/metrics'

class ModalServiceRatingMetrics extends PureComponent {
  constructor() {
    super()

    this.metricsEvents = {
      onClose: this.onClose.bind(this),
    }
  }

  onClose() {
    const { trackInteraction, onClose } = this.props

    trackInteraction(eventTypes.SERVICE_RATING_CLOSE_BUTTON_CLICK)
    onClose()
  }

  render() {
    return this.props.children(this.metricsEvents)
  }
}

ModalServiceRatingMetrics.propTypes = {
  children: func.isRequired,
  trackInteraction: func.isRequired,
  onClose: func.isRequired,
}

export default ModalServiceRatingMetrics
