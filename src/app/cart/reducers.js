import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

import { Cart, CartService } from 'domain/cart'

function getInitialState() {
  return {
    id: crypto.randomUUID(),
    products: {},
  }
}

const cart = createReducer(getInitialState(), {
  [actionTypes.ADD_PRODUCT_TO_CART]: CartService.addProduct,
  [actionTypes.REMOVE_PRODUCT_FROM_CART]: removeProductFromCart,
  [actionTypes.DECREASE_PRODUCT_FROM_CART]: decreaseProductFromCart,
  [actionTypes.REPLACE_CART_PRODUCTS]: (storeCart, cartProducts) => ({
    ...storeCart,
    products: { ...cartProducts },
  }),
  [actionTypes.CLEAR_CART]: () => getInitialState(),
  [actionTypes.REPLACE_CART]: (storeCart, cart) => cart,
  [actionTypes.SUBSTITUTE_CART_PRODUCTS]: substituteProducts,
})

function removeProductFromCart(cart, product) {
  const newCart = CartService.removeProduct(cart, product)

  if (Cart.isEmpty(newCart)) {
    newCart.id = crypto.randomUUID()
  }

  return newCart
}

function decreaseProductFromCart(cart, { product, sourceCode }) {
  const newCart = CartService.decreaseProduct(cart, { product, sourceCode })

  if (Cart.isEmpty(newCart)) {
    // eslint-disable-next-line no-unused-vars
    const { version, ...restOfNewCart } = newCart
    const emptyCart = {
      ...restOfNewCart,
      id: crypto.randomUUID(),
    }

    return emptyCart
  }

  return newCart
}

function substituteProducts(
  cart,
  { productSubstitutions, substitutedProduct },
) {
  const cartProducts = cart.products

  const newCartProducts = Object.keys(cartProducts).reduce((acc, productId) => {
    const isProductToRemove = productId === substitutedProduct.id
    if (!isProductToRemove) {
      acc[productId] = { ...cartProducts[productId] }
    }
    return acc
  }, {})

  return {
    ...cart,
    products: {
      ...newCartProducts,
      ...productSubstitutions.products,
    },
  }
}

export { cart }
