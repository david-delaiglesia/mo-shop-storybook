import { MIN_PURCHASE } from './constants'

import {
  ORIGIN_EDIT_ORDER,
  ORIGIN_FROM_MERGE_CART,
} from 'domain/cart/constants'
import { Product } from 'domain/product'

function validatePurchase(cart) {
  if (isEmpty(cart)) {
    return false
  }

  const total = getTotal(cart)

  return total >= MIN_PURCHASE
}

function getTotal(cart) {
  if (isEmpty(cart)) {
    return 0
  }

  const orderLines = Object.values(cart.products)
  const total = orderLines.reduce(addOrderLineTotal, 0)

  return total
}

function addOrderLineTotal(total, orderLine) {
  return total + orderLine.total
}

function isEmpty(cart) {
  const cartProducts = cart && cart.products
  if (!cartProducts) {
    return true
  }

  const orderLines = Object.keys(cartProducts)
  return orderLines.length < 1
}

function getItemsQuantity(cart) {
  if (isEmpty(cart)) {
    return 0
  }

  return Object.keys(cart.products).length
}

function getOrderLineUnits(orderLine) {
  if (!orderLine) {
    return 0
  }
  if (Product.isBulk(orderLine.product)) {
    return 1
  }

  return orderLine.quantity
}

const getProductQuantity = (orderLine) => {
  if (!orderLine || !orderLine.quantity) {
    return 0
  }

  return orderLine.quantity
}

function orderLinesUnitsReducer(total, orderLine) {
  return total + getOrderLineUnits(orderLine)
}

function getTotalUnits(cart) {
  if (Cart.isEmpty(cart)) {
    return 0
  }

  const orderLines = Object.values(cart.products)
  const productsAmount = orderLines.reduce(orderLinesUnitsReducer, 0)

  return productsAmount
}

function getUnpublishedQuantity(cart) {
  if (Cart.isEmpty(cart)) {
    return 0
  }

  const orderLines = Object.values(cart.products)
  const unpublished = orderLines.filter(
    (orderLine) => !orderLine.product.published,
  )

  return unpublished.length
}

function isOngoingOrder(cart) {
  return !!cart.openOrderId
}

function isAgeVerificationRequired(cart) {
  const { products } = cart
  const hasSomeProductWithAgeVerification = Object.keys(products).some(
    (productId) =>
      products[productId].requires_age_check &&
      products[productId].product.published,
  )

  return hasSomeProductWithAgeVerification
}

function hasExceededQuantityProducts(cart) {
  return cart.products.some(({ quantity, product }) => quantity > product.limit)
}

function orderLines(cart) {
  if (Cart.isEmpty(cart)) return []

  return Object.values(cart.products)
}

const getOrigin = (cart) => {
  if (cart.origin === ORIGIN_FROM_MERGE_CART) {
    return ORIGIN_FROM_MERGE_CART
  }

  return ORIGIN_EDIT_ORDER
}

const isFromMergeCartOrigin = (cart) => {
  return cart.origin === ORIGIN_FROM_MERGE_CART
}

const getSortedProducts = (cart) => {
  return Object.values(cart.products)
    .sort((a, b) => b.order - a.order)
    .map((product) => ({
      merca_code: product.id,
      quantity: product.quantity,
    }))
}

export const Cart = {
  validatePurchase,
  getTotal,
  isEmpty,
  getItemsQuantity,
  getTotalUnits,
  getUnpublishedQuantity,
  isOngoingOrder,
  isAgeVerificationRequired,
  hasExceededQuantityProducts,
  orderLines,
  getProductQuantity,
  getOrigin,
  isFromMergeCartOrigin,
  getSortedProducts,
}
