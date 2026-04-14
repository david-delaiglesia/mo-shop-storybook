import { Component } from 'react'
import { connect } from 'react-redux'

import { OrderClient } from '../../client'
import { bool, func, object, shape, string } from 'prop-types'
import { compose } from 'redux'

import { OrderProducts } from 'app/order/components/order-products'
import { preparedOrderLineMapper } from 'utils/serializer'

class OrderProductsInfoContainer extends Component {
  state = {
    products: {},
    preparedLines: [],
  }

  componentDidMount() {
    this.getOrderLines()
  }

  async getOrderLines() {
    const {
      session: { uuid: userId },
      order: { id: orderId },
    } = this.props

    const preparedLines = await OrderClient.getPreparedLines(userId, orderId)

    if (!preparedLines) {
      return
    }

    const orderProducts = preparedOrderLineMapper(preparedLines.results)

    this.setState({
      products: orderProducts,
      preparedLines: preparedLines.results,
    })
  }

  render() {
    const { products, preparedLines } = this.state
    const { order, editOrderLines, showProducts, toggleRepeatModal } =
      this.props

    return (
      <OrderProducts
        order={order}
        preparedLines={preparedLines}
        editOrderClick={editOrderLines}
        orderId={order.id}
        orderProducts={products}
        showProducts={showProducts}
        toggleRepeatModal={toggleRepeatModal}
      />
    )
  }
}

OrderProductsInfoContainer.propTypes = {
  order: object.isRequired,
  editOrderLines: func.isRequired,
  toggleRepeatModal: func.isRequired,
  session: shape({
    uuid: string.isRequired,
  }).isRequired,
  showProducts: bool.isRequired,
}

const mapStateToProps = ({ session }) => ({
  session,
})

const ComposedOrderProductsInfoContainer = compose(connect(mapStateToProps))(
  OrderProductsInfoContainer,
)

export { ComposedOrderProductsInfoContainer as OrderProductsInfoContainer }
