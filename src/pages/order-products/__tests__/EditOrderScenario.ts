import { type WrapResponse } from 'wrapito'

import { CartMother } from 'app/cart/__scenarios__/CartMother'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'

export const EditOrderScenario = {
  confirmed(): WrapResponse[] {
    const orderId = OrderMother.DEFAULT_ORDER_ID
    const cart = CartMother.simple()

    return [
      {
        path: `/customers/1/orders/${orderId}/`,
        responseBody: OrderMother.confirmed(),
      },
      { path: `/customers/1/orders/${orderId}/cart/`, responseBody: cart },
      {
        path: `/customers/1/orders/${orderId}/cart/draft/`,
        responseBody: cart,
      },
      {
        path: `/customers/1/orders/${orderId}/lines/prepared/`,
        responseBody: preparedLines,
      },
    ]
  },
}
