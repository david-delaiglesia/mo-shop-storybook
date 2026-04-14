import { clearCart, replaceCartProducts } from 'app/cart/actions'
import { updateCart } from 'app/cart/commands'
import { enableHighlightCart } from 'app/cart/containers/cart-button-container/actions'
import { deserializeCart } from 'app/cart/serializer'
import { OrderClient } from 'app/order/client'
import { OrderService } from 'domain/order'
import { addArrayProduct } from 'pages/product/actions'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'
import { Tracker } from 'services/tracker'
import { orderLineMapper } from 'utils/serializer'
import { eventTypes } from 'wrappers/metrics'

function updateStorageCart(cart) {
  const serializedCart = deserializeCart(cart)
  Storage.setItem(STORAGE_KEYS.CART, serializedCart)
}

async function getOrderLines(userId, orderId) {
  const { results } = await OrderClient.repeat(userId, orderId)
  const orderLines = OrderService.mergeOrderLinesWithSameProduct(results)
  const { orderProducts, miniOrderProducts: cartProducts } =
    orderLineMapper(orderLines)

  return {
    cartProducts,
    orderProducts,
  }
}

export async function repeatOrder(orderId, oldCartId, store) {
  store.dispatch(clearCart())

  const { session, cart } = store.getState()
  Tracker.sendInteraction(eventTypes.REPEAT_PURCHASE_COMPLETED, {
    order_id: orderId,
    cart_id: oldCartId,
    new_cart_id: cart.id,
  })

  const { orderProducts, cartProducts } = await getOrderLines(
    session.uuid,
    orderId,
  )

  store.dispatch(enableHighlightCart())
  store.dispatch(addArrayProduct(orderProducts))
  store.dispatch(replaceCartProducts(cartProducts))
  updateStorageCart({ ...cart, products: cartProducts })

  return updateCart(session, { ...cart, products: cartProducts })
}
