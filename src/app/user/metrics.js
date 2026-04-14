import { Tracker } from 'services/tracker'

const SOURCES = {
  PAYMENTS: 'payments',
  ADDRESSES: 'addresses',
  PERSONAL_INFO: 'personal_info',
  MY_PURCHASES: 'my_purchases',
}

const EVENTS = {
  CHANGE_EMAIL_CLICK: 'change_email_click',
  CHANGE_EMAIL_CANCEL_CLICK: 'change_email_cancel_button_click',
  CHANGE_EMAIL_SAVE_CLICK: 'change_email_save_button_click',
  ACCOUNT_REMOVAL_REQUEST_VIEW: 'account_removal_request_view',
  ACCOUNT_REMOVAL_REQUEST_SWITCH_CLICK: 'account_removal_request_switch_click',
  ACCOUNT_REMOVAL_REQUEST_CLICK: 'account_removal_request_click',
  ACCOUNT_REMOVAL_REQUEST_CONFIRMATION_VIEW:
    'account_removal_request_confirmation_view',
}

function sendPersonalInfoViewMetrics() {
  Tracker.sendViewChange(SOURCES.PERSONAL_INFO)
}

function sendMyPurchasesViewMetrics() {
  Tracker.sendViewChange(SOURCES.MY_PURCHASES)
}

function sendChangeEmailClickMetrics(email) {
  Tracker.sendInteraction(EVENTS.CHANGE_EMAIL_CLICK, { email })
}

function sendChangeEmailSaveClickMetrics(newEmail) {
  Tracker.sendInteraction(EVENTS.CHANGE_EMAIL_SAVE_CLICK, {
    new_email: newEmail,
  })
}

function sendChangeEmailCancelClickMetrics() {
  Tracker.sendInteraction(EVENTS.CHANGE_EMAIL_CANCEL_CLICK)
}

function sendAccountRemovalRequestView() {
  Tracker.sendInteraction(EVENTS.ACCOUNT_REMOVAL_REQUEST_VIEW)
}

function sendAccountRemovalRequestSwitchClick() {
  Tracker.sendInteraction(EVENTS.ACCOUNT_REMOVAL_REQUEST_SWITCH_CLICK)
}

function sendAccountRemovalRequestClick() {
  Tracker.sendInteraction(EVENTS.ACCOUNT_REMOVAL_REQUEST_CLICK)
}

function sendAccountRemovalRequestConfirmationView() {
  Tracker.sendInteraction(EVENTS.ACCOUNT_REMOVAL_REQUEST_CONFIRMATION_VIEW)
}

export {
  SOURCES,
  sendPersonalInfoViewMetrics,
  sendMyPurchasesViewMetrics,
  sendChangeEmailSaveClickMetrics,
  sendChangeEmailCancelClickMetrics,
  sendChangeEmailClickMetrics,
  sendAccountRemovalRequestView,
  sendAccountRemovalRequestSwitchClick,
  sendAccountRemovalRequestClick,
  sendAccountRemovalRequestConfirmationView,
}
