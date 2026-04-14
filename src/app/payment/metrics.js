import { Tracker } from 'services/tracker'

export const FLOWS = {
  CHECKOUT: 'checkout',
  CHECKOUT_TOKEN_AUTHN: 'tokenization_authentication',
  EDIT_ORDER: 'edit_order',
  EDIT_PAYMENT_METHOD: 'edit_payment_method',
}

export const SOURCES = {
  EXPIRED_CARD_ALERT: 'expired_card_alert',
  PAYMENT_METHOD_MODAL: 'payment_method_modal',
  NEW_PAYMENT_INFO_ALERT: 'new_payment_info_alert',
  MIT_TERM: 'mit_term',
  FAILED_AUTHENTICATION_ALERT: 'failed_authentication_alert',
}

const EVENTS = {
  CHANGE_PAYMENT_METHOD_CLICK: 'change_payment_method_click',
  CHANGE_PAYMENT_METHOD_FINISHED: 'change_payment_method_finished',
  NEW_PAYMENT_INFO_ALERT_CONTINUE_CLICK:
    'new_payment_info_alert_continue_click',
  NEW_PAYMENT_INFO_ALERT_CLOSE_CLICK: 'new_payment_info_alert_close_click',
  FAILED_AUTHENTICATION_ALERT_RETRY_CLICK:
    'failed_authentication_alert_retry_click',
  FAILED_AUTHENTICATION_ALERT_CLOSE_CLICK:
    'failed_authentication_alert_close_click',
  PAYMENT_INFO_MORE_INFO_CLICK: 'payment_info_more_info_click',
  MIT_TERM_CANCEL_BUTTON_CLICK: 'mit_term_cancel_button_click',
  MIT_TERM_ACCEPT_BUTTON_CLICK: 'mit_term_accept_button_click',
  TOKEN_AUTHN_FORM_CLOSED_BY_USER:
    'tokenization_authentication_form_closed_by_user',
}

function sendExpiredCardAlertViewMetrics() {
  Tracker.sendViewChange(SOURCES.EXPIRED_CARD_ALERT)
}

function sendChangePaymentMethodFinishedMetrics(payment) {
  const options = {
    payment_id: payment.id,
    payment_digits: payment.uiContent.title,
  }
  Tracker.sendInteraction(EVENTS.CHANGE_PAYMENT_METHOD_FINISHED, options)
}

function sendAuthenticationRequiredAlertViewMetrics({ flow }) {
  const eventName = {
    [FLOWS.CHECKOUT]: SOURCES.NEW_PAYMENT_INFO_ALERT,
  }
  Tracker.sendViewChange(eventName[flow])
}

function sendAuthenticationRequiredAlertContinueClickMetrics({ flow }) {
  const eventName = {
    [FLOWS.CHECKOUT]: EVENTS.NEW_PAYMENT_INFO_ALERT_CONTINUE_CLICK,
  }
  Tracker.sendInteraction(eventName[flow])
}

function sendAuthenticationRequiredAlertCloseClickMetrics({ flow }) {
  const eventName = {
    [FLOWS.CHECKOUT]: EVENTS.NEW_PAYMENT_INFO_ALERT_CLOSE_CLICK,
  }
  Tracker.sendInteraction(eventName[flow])
}

function sendFailedAuthenticationAlertRetryClickMetrics({ flow }) {
  Tracker.sendInteraction(EVENTS.FAILED_AUTHENTICATION_ALERT_RETRY_CLICK, {
    flow,
  })
}

function sendFailedAuthenticationAlertCloseClickMetrics({ flow }) {
  Tracker.sendInteraction(EVENTS.FAILED_AUTHENTICATION_ALERT_CLOSE_CLICK, {
    flow,
  })
}

function sendPaymentMethodModalViewMetrics() {
  Tracker.sendViewChange(SOURCES.PAYMENT_METHOD_MODAL)
}

function sendPaymentMethodMoreInfoClickMetrics() {
  Tracker.sendInteraction(EVENTS.PAYMENT_INFO_MORE_INFO_CLICK)
}

function sendMITTermViewMetrics(options) {
  Tracker.sendViewChange(SOURCES.MIT_TERM, options)
}

function sendMITTermCloseClickMetrics() {
  Tracker.sendInteraction(EVENTS.MIT_TERM_CANCEL_BUTTON_CLICK)
}

function sendMITTermAcceptClickMetrics() {
  Tracker.sendInteraction(EVENTS.MIT_TERM_ACCEPT_BUTTON_CLICK)
}

function sendChangePaymentMethodClickMetrics({
  checkoutId: checkout_id,
  orderId: purchase_id,
  payment,
}) {
  const options = {
    checkout_id,
    purchase_id,
    has_card: payment !== null,
  }
  Tracker.sendInteraction(EVENTS.CHANGE_PAYMENT_METHOD_CLICK, options)
}

function sendFailedAuthenticationAlertViewMetrics() {
  Tracker.sendViewChange(SOURCES.FAILED_AUTHENTICATION_ALERT)
}

function sendTokenAuthnFormClosedByUserMetrics() {
  Tracker.sendInteraction(EVENTS.TOKEN_AUTHN_FORM_CLOSED_BY_USER)
}

export {
  sendAuthenticationRequiredAlertCloseClickMetrics,
  sendAuthenticationRequiredAlertContinueClickMetrics,
  sendAuthenticationRequiredAlertViewMetrics,
  sendChangePaymentMethodClickMetrics,
  sendChangePaymentMethodFinishedMetrics,
  sendExpiredCardAlertViewMetrics,
  sendFailedAuthenticationAlertCloseClickMetrics,
  sendFailedAuthenticationAlertRetryClickMetrics,
  sendFailedAuthenticationAlertViewMetrics,
  sendMITTermAcceptClickMetrics,
  sendMITTermCloseClickMetrics,
  sendMITTermViewMetrics,
  sendPaymentMethodModalViewMetrics,
  sendPaymentMethodMoreInfoClickMetrics,
  sendTokenAuthnFormClosedByUserMetrics,
}
