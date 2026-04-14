import { actionTypes } from './actions'

import { createReducer } from '@mercadona/mo.library.dashtil'

const INITIAL_STATE = {}

const products = createReducer(INITIAL_STATE, {
  [actionTypes.ADD_PRODUCT]: saveProduct,
  [actionTypes.ADD_ARRAY_PRODUCTS]: saveProducts,
})

function saveProduct(products, payload) {
  const id = payload.id
  return {
    ...products,
    [id]: { ...products[id], ...payload },
  }
}

function saveProducts(products, payload) {
  const newPayload = mergeProducts(products, payload)
  return {
    ...products,
    ...newPayload,
  }
}

function mergeProducts(products, payload) {
  const mergedProducts = {}
  for (let i in payload) {
    mergedProducts[payload[i].id] = {
      ...payload[payload[i].id],
    }
    if (products[payload[i].id]) {
      mergedProducts[payload[i].id] = {
        ...products[payload[i].id],
        ...payload[payload[i].id],
      }
    }
  }
  return mergedProducts
}

export { products }
