import { Tracker } from 'services/tracker'

export const SOURCES = {
  AUTH: 'auth',
  PROFILE: 'profile',
  CHECKOUT: 'checkout',
  DIALOG: 'dialog',
  RECOMMENDATIONS: 'recommendations',
  FORCE_LOGIN_POPUP_ALERT: 'force_login_popup_alert',
}

const EVENTS = {
  LOGOUT_CLICK: 'logout_click',
  FAQ_CLICK: 'faq_click',
  FORCE_LOGIN_POPUP_ALERT_CANCEL_CLICK: 'force_login_popup_alert_cancel_click',
  FORCE_LOGIN_POPUP_ALERT_LOGIN_CLICK: 'force_login_popup_alert_login_click',
  RECAPTCHA_LIBRARY_ERROR: 'recaptcha_library_error',
}

function sendAuthViewMetrics() {
  Tracker.sendViewChange(SOURCES.AUTH)
}

function sendProfileViewMetrics() {
  Tracker.sendViewChange(SOURCES.PROFILE)
}

function sendLogoutClickMetrics() {
  Tracker.sendInteraction(EVENTS.LOGOUT_CLICK)
}

function sendFAQClickMetrics() {
  Tracker.sendInteraction(EVENTS.FAQ_CLICK)
}

function sendForceLoginPopupAlertViewMetrics() {
  Tracker.sendViewChange(SOURCES.FORCE_LOGIN_POPUP_ALERT)
}

function sendForceLoginPopupAlertCancelClickMetrics() {
  Tracker.sendInteraction(EVENTS.FORCE_LOGIN_POPUP_ALERT_CANCEL_CLICK)
}

function sendForceLoginPopupAlertLoginClickMetrics() {
  Tracker.sendInteraction(EVENTS.FORCE_LOGIN_POPUP_ALERT_LOGIN_CLICK)
}

export function sendRecaptchaErrorMetrics({ email, error }) {
  Tracker.sendInteraction(EVENTS.RECAPTCHA_LIBRARY_ERROR, {
    email,
    error_description: error.toString(),
  })
}

export {
  sendAuthViewMetrics,
  sendProfileViewMetrics,
  sendLogoutClickMetrics,
  sendFAQClickMetrics,
  sendForceLoginPopupAlertViewMetrics,
  sendForceLoginPopupAlertCancelClickMetrics,
  sendForceLoginPopupAlertLoginClickMetrics,
}
