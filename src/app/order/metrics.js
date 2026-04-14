import { OrderPaymentStatus, OrderStatusUI } from './interfaces'

import { serializeOrder } from 'app/order/serializer'
import { Cart } from 'domain/cart'
import { Order } from 'domain/order'
import { Tracker } from 'services/tracker'

const SOURCES = {
  ADDRESS_CONFIRMATION: 'address_confirmation',
  TELEPHONE: 'telephone',
  EDIT_PURCHASE_COMPLETED_ALERT: 'edit_purchase_completed_alert',
  SYSTEM_DISMISS_EDIT_PURCHASE_ALERT: 'system_dismiss_edit_purchase_alert',
  YEARSOLD_MODAL: '18_yearsold_modal',
  MINIMUM_PRICE_MODAL: 'minimum_price_alert',
  CONFIRMATION: 'confirmation',
}

const EVENTS = {
  ORDER_DETAILS_SEE_PRODUCTS_CLICK: 'order_details_see_products_click',
  CHANGE_DELIVERY_CLICK: 'change_delivery_click',
  CHANGE_ADDRESS_CLICK: 'change_address_click',
  WIDGET_CLICK: 'widget_click',
  DISMISS_EDIT_PURCHASE_CHANGES_CLICK: 'dismiss_edit_purchase_changes_click',
  SYSTEM_DISMISS_EDIT_PURCHASE_ALERT_CONFIRM_CLICK:
    'system_dismiss_edit_purchase_alert_confirm_click',
  SAVE_PURCHASE_PRODUCTS_CLICK: 'save_purchase_products_click',
  REPEAT_PURCHASE_CLICK: 'repeat_purchase_click',
  TICKET_DOWNLOAD_CLICK: 'ticket_download_click',
  LAST_PURCHASE_EDITION_CLICK: 'last_purchase_edition_click',
  EDIT_PURCHASE_PRODUCTS_CLICK: 'edit_purchase_products_click',
  YEARSOLD_MODAL_CANCEL_BUTTON_CLICK: '18_yearsold_modal_cancel_button_click',
  YEARSOLD_MODAL_CONFIRMATION_BUTTON_CLICK:
    '18_yearsold_modal_confirmation_button_click',
  PRICE_DETAIL_CLICK: 'price_detail_click',
  CANCEL_PURCHASE_CLICK: 'cancel_purchase_click',
  CANCEL_PURCHASE_CONFIRMATION_CLICK: 'cancel_purchase_confirmation_click',
  EDITION_CONFIRMED: 'edition_confirmed',
  PHONE_NUMBER_SAVE_CLICK: 'phone_number_save_click',
  CHANGE_TELEPHONE_CLICK: 'change_telephone_click',
  CLEAN_ONGOING_ORDER_CART_FROM_LEAVE_EDITION:
    'clean_ongoing_order_cart_from_leave_edition',
  CLEAN_ONGOING_ORDER_CART_ON_PAGE_START:
    'clean_ongoing_order_cart_on_page_start',
  REMOVE_ALL_PRODUCTS_CANCEL_ORDER_MODAL_VIEW:
    'remove_all_products_cancel_order_modal_view',
  REMOVE_ALL_PRODUCTS_CANCEL_ORDER_MODAL_CLOSE:
    'remove_all_products_cancel_order_modal_close',
  DIFFERENT_CUTOFF_MODAL_VIEW: 'different_cutoff_modal_view',
  DIFFERENT_CUTOFF_MODAL_ACCEPT: 'different_cutoff_modal_accept',
  DIFFERENT_CUTOFF_REQUEST_ERROR: 'different_cutoff_request_error',
}

const STATUSES = {
  [OrderStatusUI.CONFIRMED]: 'Confirmed',
  [OrderStatusUI.PREPARING]: 'Preparing',
  [OrderStatusUI.PREPARED]: 'Prepared',
  [OrderStatusUI.DELIVERED]: 'Delivered',
  [OrderStatusUI.DELIVERING]: 'Delivering',
  [OrderStatusUI.CANCELLED_BY_SYSTEM]: 'Cancelled',
  [OrderStatusUI.CANCELLED_BY_USER]: 'Cancelled',
  [OrderStatusUI.DISRUPTED_BY_CUSTOMER]: 'User unreachable',
  [OrderStatusUI.DISRUPTED_BY_SYSTEM]: 'Delivery issue',
  PAYMENT_DISRUPTED: 'Payment issue',
}

export const EDIT_PURCHASE_PRODUCTS_SOURCES = {
  WIDGET: 'widget',
  PURCHASE: 'purchase',
}

function getOrderStatus(order) {
  const serializedOrder = serializeOrder(order)
  if (Order.hasPaymentFailed(serializedOrder)) return STATUSES.PAYMENT_DISRUPTED
  return STATUSES[order.status]
}

export function sendShowProductMetrics(order) {
  const status = getOrderStatus(order)
  Tracker.sendInteraction(EVENTS.ORDER_DETAILS_SEE_PRODUCTS_CLICK, {
    order_status: status,
  })
}

export function sendChangeAddressClickMetrics(address) {
  const {
    address: current_address_name,
    postalCode: current_address_postal_code,
  } = address
  const options = {
    current_address_name,
    current_address_postal_code,
  }
  Tracker.sendInteraction(EVENTS.CHANGE_ADDRESS_CLICK, options)
}

export function sendChangeDeliveryClickMetrics(checkout) {
  if (Order.isConfirmed(checkout)) {
    const options = { order_id: checkout.id }
    Tracker.sendInteraction(EVENTS.CHANGE_DELIVERY_CLICK, options)
  }

  if (!Order.isConfirmed(checkout)) {
    const options = { purchase_id: checkout.id }
    Tracker.sendInteraction(EVENTS.CHANGE_DELIVERY_CLICK, options)
  }
}

export function sendAddressConfirmationViewMetrics() {
  Tracker.sendViewChange(SOURCES.ADDRESS_CONFIRMATION)
}

export function sendTelephoneViewMetrics() {
  Tracker.sendViewChange(SOURCES.TELEPHONE)
}

export function sendEditPurchaseCompletedAlertViewMetrics() {
  Tracker.sendViewChange(SOURCES.EDIT_PURCHASE_COMPLETED_ALERT)
}

export function getStatus(order) {
  if (order.paymentStatus === OrderPaymentStatus.FAILED) {
    return 'payment-issue'
  }
  if (
    order.paymentStatus === OrderPaymentStatus.REPREPARED_WITH_PENDING_PAYMENT
  ) {
    return 'reprepared-payment-issue'
  }
  return order.status
}

export function sendWidgetClickMetrics(order, action) {
  const { id, slot: slot_date } = order
  const orderStatus = getStatus(order)
  const options = {
    id,
    slot_date,
    status: orderStatus,
    action,
  }
  Tracker.sendInteraction(EVENTS.WIDGET_CLICK, options)
}

export function sendEditPurchaseChangesAlertMetrics(options) {
  Tracker.sendInteraction(EVENTS.DISMISS_EDIT_PURCHASE_CHANGES_CLICK, options)
}

export function sendSavePurchaseProductsMetrics({ orderId, cartId, price }) {
  const options = { purchase_id: orderId, cart_id: cartId, price }
  Tracker.sendInteraction(EVENTS.SAVE_PURCHASE_PRODUCTS_CLICK, options)
}

export function sendSystemEditPurchaseAlertViewMetrics() {
  Tracker.sendViewChange(SOURCES.SYSTEM_DISMISS_EDIT_PURCHASE_ALERT)
}

export function sendSystemEditPurchaseAlertConfirmClickMetrics() {
  Tracker.sendInteraction(
    EVENTS.SYSTEM_DISMISS_EDIT_PURCHASE_ALERT_CONFIRM_CLICK,
  )
}

export function sendCleanOngoingOrderCartFromLeaveEdition() {
  Tracker.sendInteraction(EVENTS.CLEAN_ONGOING_ORDER_CART_FROM_LEAVE_EDITION)
}

export function sendCleanOngoingOrderCartOnPageStart() {
  Tracker.sendInteraction(EVENTS.CLEAN_ONGOING_ORDER_CART_ON_PAGE_START)
}

export function sendRepeatPurchaseClickMetrics({ cart, order, source }) {
  const options = {
    is_cart_empty: Cart.isEmpty(cart),
    purchase_id: order.id,
    source,
  }
  Tracker.sendInteraction(EVENTS.REPEAT_PURCHASE_CLICK, options)
}

export function sendTicketDownloadClickMetrics(source) {
  Tracker.sendInteraction(EVENTS.TICKET_DOWNLOAD_CLICK, { source })
}

export function sendLastPurchaseEditionClickMetrics() {
  Tracker.sendInteraction(EVENTS.LAST_PURCHASE_EDITION_CLICK)
}

export function sendEditPurchaseProductsMetrics({ orderId, source }) {
  const options = {
    purchase_id: orderId,
    source,
  }
  Tracker.sendInteraction(EVENTS.EDIT_PURCHASE_PRODUCTS_CLICK, options)
}

export function sendYearsoldModalViewMetrics(price) {
  Tracker.sendViewChange(SOURCES.YEARSOLD_MODAL, { price })
}

export function sendMinimumPriceModalViewMetrics(cart, cartMode) {
  const totalPrice = Cart.getTotal(cart)
  const options = { price: totalPrice, cart_mode: cartMode }

  Tracker.sendViewChange(SOURCES.MINIMUM_PRICE_MODAL, options)
}

export function sendYearsoldConfirmationButtonClickViewMetrics() {
  Tracker.sendInteraction(EVENTS.YEARSOLD_MODAL_CONFIRMATION_BUTTON_CLICK)
}

export function sendYearsoldCancelButtonClickViewMetrics() {
  Tracker.sendInteraction(EVENTS.YEARSOLD_MODAL_CANCEL_BUTTON_CLICK)
}

/**
 * @deprecated Use OrderMetrics.orderConfirmationView instead
 */
export function sendConfirmationViewMetrics(order) {
  const { id, summary } = order
  const options = { order_id: id, price: summary.total }

  Tracker.sendViewChange(SOURCES.CONFIRMATION, options)
}

export function sendPriceDetailClickMetrics() {
  Tracker.sendInteraction(EVENTS.PRICE_DETAIL_CLICK)
}

export function sendCancelPurchaseClickMetrics(order) {
  Tracker.sendInteraction(EVENTS.CANCEL_PURCHASE_CLICK, {
    purchase_id: order.id,
  })
}

export function sendCancelPurchaseConfirmationClickMetrics(order) {
  Tracker.sendInteraction(EVENTS.CANCEL_PURCHASE_CONFIRMATION_CLICK, {
    purchase_id: order.id,
  })
}

export function sendEditionConfirmedMetrics({ orderId, price }) {
  Tracker.sendInteraction(EVENTS.EDITION_CONFIRMED, {
    order_id: orderId,
    price,
  })
}

export function sendPhoneNumberSaveClickMetrics({ countryCode, phoneNumber }) {
  Tracker.sendInteraction(EVENTS.PHONE_NUMBER_SAVE_CLICK, {
    country_code: countryCode,
    national_phone_number: phoneNumber,
  })
}

export function sendChangePhoneNumberMetrics({
  checkoutId,
  orderId,
  countryCode,
  phoneNumber,
}) {
  Tracker.sendInteraction(EVENTS.CHANGE_TELEPHONE_CLICK, {
    checkout_id: checkoutId,
    purchase_id: orderId,
    has_phone: !!phoneNumber,
    country_code: countryCode,
    national_phone_number: phoneNumber,
  })
}

export function sendRemoveAllProductsCancelOrderModalMetrics(orderId) {
  Tracker.sendInteraction(EVENTS.REMOVE_ALL_PRODUCTS_CANCEL_ORDER_MODAL_VIEW, {
    order_id: orderId,
  })
}

export function sendRemoveAllProductsCancelOrderModalCloseMetrics(
  orderId,
  option,
) {
  Tracker.sendInteraction(EVENTS.REMOVE_ALL_PRODUCTS_CANCEL_ORDER_MODAL_CLOSE, {
    order_id: orderId,
    option,
  })
}

export const sendDifferentCutoffModalViewMetrics = (cutoffTime, orderId) => {
  Tracker.sendInteraction(EVENTS.DIFFERENT_CUTOFF_MODAL_VIEW, {
    cutoff_time: cutoffTime,
    order_id: orderId,
  })
}

export const sendDifferentCutoffModalAcceptMetrics = (cutoffTime, orderId) => {
  Tracker.sendInteraction(EVENTS.DIFFERENT_CUTOFF_MODAL_ACCEPT, {
    cutoff_time: cutoffTime,
    order_id: orderId,
  })
}

export const sendDifferentCutoffModalErrorMetrics = (cutoffTime, orderId) => {
  Tracker.sendInteraction(EVENTS.DIFFERENT_CUTOFF_REQUEST_ERROR, {
    cutoff_time: cutoffTime,
    order_id: orderId,
  })
}
