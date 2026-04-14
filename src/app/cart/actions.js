export const actionTypes = {
  ADD_PRODUCT_TO_CART: 'ADD_PRODUCT_TO_CART',
  REPLACE_CART_PRODUCTS: 'REPLACE_CART_PRODUCTS',
  DECREASE_PRODUCT_FROM_CART: 'DECREASE_PRODUCT_FROM_CART',
  REMOVE_PRODUCT_FROM_CART: 'REMOVE_PRODUCT_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  REPLACE_CART: 'REPLACE_CART',
  SUBSTITUTE_CART_PRODUCTS: 'SUBSTITUTE_CART_PRODUCTS',
}

export const addProductToCart = ({
  product,
  sourceCode,
  isAddingWholeShoppingListToCart,
}) => ({
  type: actionTypes.ADD_PRODUCT_TO_CART,
  payload: { product, sourceCode, isAddingWholeShoppingListToCart },
})

export const decreaseProductFromCart = ({ product, sourceCode }) => ({
  type: actionTypes.DECREASE_PRODUCT_FROM_CART,
  payload: { product, sourceCode },
})

export const removeProductFromCart = (product) => ({
  type: actionTypes.REMOVE_PRODUCT_FROM_CART,
  payload: product,
})

export const clearCart = () => ({
  type: actionTypes.CLEAR_CART,
})

export const replaceCartProducts = (orderLines) => ({
  type: actionTypes.REPLACE_CART_PRODUCTS,
  payload: orderLines,
})

export const replaceCart = (cart) => ({
  type: actionTypes.REPLACE_CART,
  payload: cart,
})

export const substituteCartProducts = (
  productSubstitutions,
  substitutedProduct,
) => ({
  type: actionTypes.SUBSTITUTE_CART_PRODUCTS,
  payload: { productSubstitutions, substitutedProduct },
})
