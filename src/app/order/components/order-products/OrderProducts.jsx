import { Component } from 'react'

import OrderProductCell from '../order-product-cell'
import { array, bool, func, number, object } from 'prop-types'

import { Icon } from '@mercadona/mo.library.shop-ui/icon'

import { withTranslate } from 'app/i18n/containers/i18n-provider'
import {
  EDIT_PURCHASE_PRODUCTS_SOURCES,
  sendEditPurchaseProductsMetrics,
  sendShowProductMetrics,
} from 'app/order/metrics'
import { RichTitle } from 'components/rich-title'
import { Order, OrderPropTypes } from 'domain/order'

import './styles/OrderProducts.css'

class OrderProducts extends Component {
  state = {
    showProducts: this.props.showProducts,
  }

  componentDidMount() {
    if (this.props.showProducts) {
      document.querySelector('.order-products').scrollIntoView()
    }
  }

  toggleProducts = () => {
    if (!this.state.showProducts) {
      sendShowProductMetrics(this.props.order)
    }

    this.setState((state) => ({ showProducts: !state.showProducts }))
  }

  editOrder = () => {
    const { editOrderClick, orderId } = this.props
    sendEditPurchaseProductsMetrics({
      orderId,
      source: EDIT_PURCHASE_PRODUCTS_SOURCES.PURCHASE,
    })
    editOrderClick()
  }

  render = () => {
    const { order, orderProducts, preparedLines, toggleRepeatModal, t } =
      this.props
    const { showProducts } = this.state

    const getIcon = () => {
      if (showProducts) return 'chevron-up'
      return 'chevron-down'
    }

    const showRepeatOrder = showProducts && Order.isRepeatable(order)

    return (
      <article className="order-products" data-testid="order-products">
        <RichTitle
          label={t('commons.order.order_products.title', {
            count: order.products_count,
          })}
          labeldatatest="open-order-lines"
          showEditButton={Order.isEditable(order)}
          buttonAction={this.editOrder}
          labelAction={this.toggleProducts}
          content={
            <Icon
              icon={getIcon()}
              className="order-products__toggle-products"
            />
          }
          showSecondaryButton={showRepeatOrder}
          secondaryButtonText={t('button.repeat_order')}
          secondaryButtonAction={toggleRepeatModal}
          subtitle={t('repeat_purchase_hint')}
          aria-haspopup="grid"
          aria-expanded={showProducts}
          aria-controls={showProducts ? 'order-products-lines' : undefined}
        />
        {showProducts && (
          <ul data-testid="order-products-lines" id="order-products-lines">
            {preparedLines.map((line, index) => (
              <OrderProductCell
                key={index}
                line={line}
                product={orderProducts[line.product.id]}
                order={order}
              />
            ))}
          </ul>
        )}
      </article>
    )
  }
}

OrderProducts.propTypes = {
  preparedLines: array.isRequired,
  orderProducts: object.isRequired,
  order: OrderPropTypes.isRequired,
  orderId: number.isRequired,
  editOrderClick: func.isRequired,
  toggleRepeatModal: func.isRequired,
  t: func.isRequired,
  showProducts: bool.isRequired,
}

const ComposedOrderProducts = withTranslate(OrderProducts)

export { ComposedOrderProducts as OrderProducts }
