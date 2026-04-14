export const actionTypes = {
  ADD_PRODUCT: 'ADD_PRODUCT',
  ADD_ARRAY_PRODUCTS: 'ADD_ARRAY_PRODUCTS',
}

export function addProduct(payload) {
  return {
    payload,
    type: actionTypes.ADD_PRODUCT,
  }
}

export function addArrayProduct(payload) {
  return {
    payload,
    type: actionTypes.ADD_ARRAY_PRODUCTS,
  }
}
