import { PureComponent } from 'react'

import { func, shape, string } from 'prop-types'

class OrderDetailMetrics extends PureComponent {
  componentDidMount() {
    const { params } = this.props.match
    const options = { purchase_id: params.id }
    this.props.trackViewChange(options)
  }

  render() {
    return this.props.children()
  }
}

OrderDetailMetrics.propTypes = {
  children: func.isRequired,
  trackViewChange: func,
  match: shape({
    params: shape({
      id: string.isRequired,
    }).isRequired,
  }).isRequired,
}

export default OrderDetailMetrics
