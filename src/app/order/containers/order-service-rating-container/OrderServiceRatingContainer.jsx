import { Component, Fragment } from 'react'

import { ServiceRatingContainer } from '../../../service-rating/containers/service-rating-container'
import OrderServiceRating from '../../components/order-service-rating'
import ModalServiceRatingMetrics from './ModalServiceRatingMetrics'
import OrderServiceRatingContainerMetrics from './OrderServiceRatingContainerMetrics'
import { func, object } from 'prop-types'

import Modal from 'components/modal'
import { withInteractionMetrics } from 'wrappers/metrics'

const OrderServiceRatingWithMetrics = withInteractionMetrics(
  OrderServiceRatingContainerMetrics,
)(OrderServiceRating)
const ModalServiceRatingWithMetrics = withInteractionMetrics(
  ModalServiceRatingMetrics,
)(Modal)

class OrderServiceRatingContainer extends Component {
  state = {
    showModal: false,
  }

  constructor() {
    super()

    this.openModal = this.openModal.bind(this)
    this.closeModal = this.closeModal.bind(this)
    this.onFinish = this.onFinish.bind(this)
  }

  closeModal() {
    this.setState({ showModal: false })
  }

  openModal() {
    this.setState({ showModal: true })
  }

  onFinish() {
    this.closeModal()
    this.props.updateOrder({ ...this.props.order, serviceRatingToken: null })
  }

  render() {
    const { order } = this.props
    const { showModal } = this.state

    return (
      <Fragment>
        <OrderServiceRatingWithMetrics rate={this.openModal} />
        {showModal && (
          <ModalServiceRatingWithMetrics
            onClose={this.closeModal}
            showButtonModal
          >
            <ServiceRatingContainer
              token={order.serviceRatingToken}
              onFinish={this.onFinish}
            />
          </ModalServiceRatingWithMetrics>
        )}
      </Fragment>
    )
  }
}

OrderServiceRatingContainer.propTypes = {
  order: object.isRequired,
  updateOrder: func.isRequired,
}

export default OrderServiceRatingContainer
