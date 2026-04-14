import { number, oneOf, shape, string } from 'prop-types'

import { OrderPaymentStatus, OrderStatusUI } from 'app/order'

/**
 * @deprecated Use Order interface instead
 */
export const OrderPropTypes = shape({
  id: number.isRequired,
  order_id: number.isRequired,
  summary: shape({
    total: string.isRequired,
  }).isRequired,
  status: oneOf(Object.values(OrderStatusUI)).isRequired,
  products_count: number.isRequired,
  price: string.isRequired,
  paymentStatus: oneOf(Object.values(OrderPaymentStatus)),
  slot: shape({
    start: string.isRequired,
    end: string.isRequired,
  }).isRequired,
})
