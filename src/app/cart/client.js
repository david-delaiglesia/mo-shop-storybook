import {
  deserializeCart,
  deserializeCartFromShoppingList,
  serializeCart,
  serializeCartListTooltip,
} from 'app/cart/serializer'
import { Http, HttpWithErrorHandler, NetworkError } from 'services/http'

function validate(cart) {
  const options = {
    body: JSON.stringify(cart),
    shouldCatchErrors: false,
  }
  return HttpWithErrorHandler.post('/carts/', options).then(serializeCart)
}

function getCart(userUuid) {
  return HttpWithErrorHandler.auth()
    .get(`/customers/${userUuid}/cart/`)
    .then(serializeCart)
}

function updateCart(userId, cart) {
  const path = `/customers/${userId}/cart/`

  const deserializedCart = deserializeCart(cart)
  const options = {
    body: JSON.stringify(deserializedCart),
  }

  return Http.auth()
    .put(path, options)
    .then(serializeCart)
    .catch(NetworkError.publish)
}

const updateCartFromShoppingList = (userId, cart) => {
  const path = `/customers/${userId}/cart/`

  const deserializedCart = deserializeCartFromShoppingList(cart)
  const options = {
    body: JSON.stringify(deserializedCart),
  }

  return Http.auth().put(path, options).then(serializeCart)
}

const createShoppingListFromProducts = (userId, name, products) => {
  const path = `/customers/${userId}/shopping-lists/create-with-products/`
  const options = {
    body: JSON.stringify({
      name,
      products,
    }),
    shouldCatchErrors: false,
  }
  return HttpWithErrorHandler.auth()
    .post(path, options)
    .then((response) => response.id)
}

const checkCartListTooltip = (userUuid) => {
  return HttpWithErrorHandler.auth()
    .post(`/customers/${userUuid}/tooltips/cart-to-list/`)
    .then(serializeCartListTooltip)
}

const CartClient = {
  validate,
  getCart,
  updateCart,
  updateCartFromShoppingList,
  createShoppingListFromProducts,
  checkCartListTooltip,
}

export { CartClient }
