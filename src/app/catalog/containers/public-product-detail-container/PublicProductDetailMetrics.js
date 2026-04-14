import { Component } from 'react'

import { func, object } from 'prop-types'

import { eventTypes } from 'wrappers/metrics'

class PublicProductDetailMetrics extends Component {
  onOpenInAppInteracctionMetrics = () => {
    const { product, trackInteraction } = this.props
    const options = {
      product_id: product.id,
    }
    trackInteraction(eventTypes.OPEN_IN_APP_CLICK, options)
  }

  render() {
    return this.props.children({
      onClickMetrics: this.onOpenInAppInteracctionMetrics,
    })
  }
}

PublicProductDetailMetrics.propTypes = {
  product: object.isRequired,
  children: func.isRequired,
  trackInteraction: func.isRequired,
}

export { PublicProductDetailMetrics }
