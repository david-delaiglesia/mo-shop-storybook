import { OrderStatus } from './interfaces'
import {
  serializeOrder,
  serializeOrders,
  serializePreparedOrderLines,
  serializeProductDetail,
} from './serializer'

import { snakeCaseToCamelCase } from '@mercadona/mo.library.dashtil'

import { deserializeAddress } from 'app/address/serializer'
import { deserializeCart, serializeCart } from 'app/cart/serializer'
import { HttpWithErrorHandler } from 'services/http'

async function getById(userUuId, purchaseId) {
  const path = `/customers/${userUuId}/orders/${purchaseId}/`

  return HttpWithErrorHandler.auth().get(path).then(serializeOrder)
}

async function updateContactInfo(userUuid, orderId, contactInfo) {
  const path = `/customers/${userUuid}/orders/${orderId}/phone-number/`
  const options = {
    body: JSON.stringify(contactInfo),
    shouldCatchErrors: false,
  }
  return HttpWithErrorHandler.auth().put(path, options).then(serializeOrder)
}

/**
 * @throws {SlotTakenException | SlotNotBookedException | AddressNotInWarehouseException}
 */
async function updateDeliveryInfo(userUuid, orderId, deliveryInfo) {
  const path = `/customers/${userUuid}/orders/${orderId}/delivery-info/`
  const options = {
    body: JSON.stringify({
      address: deserializeAddress(deliveryInfo.address),
      slot: deliveryInfo.slot,
    }),
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.auth().put(path, options).then(serializeOrder)
}

async function updatePaymentInfo(userUuid, orderId, paymentInfo) {
  const path = `/customers/${userUuid}/orders/${orderId}/payment-method/`

  const options = {
    body: JSON.stringify({ payment_method: paymentInfo }),
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.auth().put(path, options).then(serializeOrder)
}

async function retryPayment(userUuid, orderId) {
  const path = `/customers/${userUuid}/orders/${orderId}/payment-retry/`

  const options = {
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.auth().post(path, options).then(serializeOrder)
}

async function getCart(userId, orderId) {
  const path = `/customers/${userId}/orders/${orderId}/cart/`
  return HttpWithErrorHandler.auth().get(path).then(serializeCart)
}

async function getCartDraft(userId, orderId) {
  const path = `/customers/${userId}/orders/${orderId}/cart/draft/`
  const options = {
    shouldCatchErrors: false,
  }
  return HttpWithErrorHandler.auth().get(path, options).then(serializeCart)
}

async function getIfCartDraftByCustomer(userId) {
  const path = `/customers/${userId}/orders/cart/drafts/`
  const options = {
    shouldCatchErrors: false,
  }
  return HttpWithErrorHandler.auth().get(path, options)
}

/**
 * @throws {418 | 419 | PaymentAuthenticationRequiredException}
 */
async function updateCart(userUuid, orderId, cart) {
  const path = `/customers/${userUuid}/orders/${orderId}/cart/`

  const options = {
    body: JSON.stringify({ cart: deserializeCart(cart) }),
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.auth().put(path, options)
}

async function updateCartDraft(userUuid, orderId, cart, origin) {
  const path = `/customers/${userUuid}/orders/${orderId}/cart/draft/`
  const deserializedCart = deserializeCart(cart)
  const body = { origin, ...deserializedCart }

  const options = {
    body: JSON.stringify(body),
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.auth().put(path, options)
}

async function removeDraft(userId, orderId) {
  const path = `/customers/${userId}/orders/${orderId}/cart/draft/`
  const options = {
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.auth().delete(path, options)
}

/**
 * @param {string} userUuid
 * @param {string | number} orderId
 * @returns {Promise<void>}
 */
async function cancel(userUuid, orderId) {
  const path = `/customers/${userUuid}/orders/${orderId}/`

  return HttpWithErrorHandler.auth().delete(path)
}

async function getTicket(userId, purchaseId) {
  const path = `/customers/${userId}/orders/${purchaseId}/receipt/`
  const options = {
    headers: { Accept: 'application/pdf' },
  }

  return HttpWithErrorHandler.auth().get(path, options)
}

async function repeat(userId, orderId) {
  const path = `/customers/${userId}/orders/${orderId}/repeat/`

  return HttpWithErrorHandler.auth().get(path)
}

/**
 *
 * @param {string} userId
 * @param {number} page
 * @param {{ status?: OrderStatus }} params
 * @returns {Promise<{ nextPage: number | null, orders: Order[] }>}
 */
async function getByPage(userId, page, params = {}) {
  const options = {
    params: {
      page,
      ...params,
    },
  }
  const path = `/customers/${userId}/orders/`

  return HttpWithErrorHandler.auth().get(path, options).then(serializeOrders)
}

async function getConfirmedOrders(userId) {
  return getByPage(userId, 1, { status: OrderStatus.CONFIRMED })
}

async function getPreparedLines(userId, orderId) {
  const path = `/customers/${userId}/orders/${orderId}/lines/prepared/`
  return HttpWithErrorHandler.auth().get(path).then(serializePreparedOrderLines)
}

function validateMergingCartToOrder(userUuid, openOrderId, cart) {
  const path = `/customers/${userUuid}/orders/${openOrderId}/cart/validate-merge/`
  const options = {
    body: JSON.stringify({ cart: deserializeCart(cart) }),
    shouldCatchErrors: false,
  }
  return HttpWithErrorHandler.auth().post(path, options).then(serializeCart)
}

function removeBlinkingProducts(userUuid, orderId, blinkingProductIdsList) {
  const path = `/customers/${userUuid}/orders/${orderId}/remove-lines/`

  const options = {
    body: JSON.stringify({ product_ids: blinkingProductIdsList }),
  }

  return HttpWithErrorHandler.auth().post(path, options).then(serializeOrder)
}

async function getProductDetail({ customerId, orderId, productId, warehouse }) {
  const options = {
    shouldCatchErrors: false,
    params: { wh: warehouse },
  }
  return HttpWithErrorHandler.get(
    `/customers/${customerId}/orders/${orderId}/products/${productId}/`,
    options,
  ).then(serializeProductDetail)
}

/**
 * @returns {Promise<{ earlierCutoff: boolean }>}
 */
const getEarlierCutoff = (customerId, orderId) => {
  const options = {
    shouldCatchErrors: false,
  }

  return HttpWithErrorHandler.auth()
    .get(`/customers/${customerId}/orders/${orderId}/earlier-cutoff/`, options)
    .then(snakeCaseToCamelCase)
}

export const OrderClient = {
  getByPage,
  getById,
  updateContactInfo,
  updateDeliveryInfo,
  updatePaymentInfo,
  retryPayment,
  getPreparedLines,
  cancel,
  getTicket,
  repeat,
  getCart,
  getCartDraft,
  getIfCartDraftByCustomer,
  removeDraft,
  updateCart,
  updateCartDraft,
  getConfirmedOrders,
  validateMergingCartToOrder,
  removeBlinkingProducts,
  getProductDetail,
  getEarlierCutoff,
}
