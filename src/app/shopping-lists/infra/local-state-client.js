import { createThunk } from '@mercadona/mo.library.dashtil'

import { addProductToCart } from 'app/cart/actions'

const addProductsToCartThunk = async ({ products, sourceCode }, store) => {
  const { cart } = store.getState()

  const lastItemAddedIndex = Math.max(
    ...Object.values(cart.products).map((product) => product.order),
    0,
  )

  products.reverse().forEach((product, index) => {
    product.shoppingListOrder = lastItemAddedIndex + index + 1
    store.dispatch(
      addProductToCart({
        product,
        sourceCode,
        isAddingWholeShoppingListToCart: true,
      }),
    )
  })
  const { cart: updatedCart } = store.getState()

  return Promise.resolve(updatedCart)
}

const updateCart = async ({ products, sourceCode }, dispatch) => {
  return await dispatch(
    createThunk(addProductsToCartThunk)({ products, sourceCode }),
  )
}

export const LocalStateClient = {
  updateCart,
}
