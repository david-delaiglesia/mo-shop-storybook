import { Component } from 'react'

import { func } from 'prop-types'

import { eventTypes } from 'wrappers/metrics'

class EmptyProductMetrics extends Component {
  onLinkClick = () => {
    const { trackInteraction, onLinkClick } = this.props
    trackInteraction(eventTypes.PRODUCT_EMPTY_CASE_CLICK)
    onLinkClick()
  }

  render() {
    return this.props.children({ onLinkClick: this.onLinkClick })
  }
}

EmptyProductMetrics.propTypes = {
  children: func.isRequired,
  trackInteraction: func.isRequired,
  onLinkClick: func,
}

EmptyProductMetrics.defaultProps = {
  onLinkClick: () => null,
}

export { EmptyProductMetrics }
