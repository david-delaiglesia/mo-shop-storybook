import { matchPath } from 'react-router'

import './framework'

import { getSupportLanguage } from 'utils/languages'

const ZENDESK_LABELS = {
  '/': 'home_widget',
  '/user-area/personal-info': 'profile_widget_personal_details',
  '/user-area/address': 'profile_widget_address',
  '/user-area/payments': 'profile_widget_payments',
  '/user-area/orders': 'profile_widget_orders',
  '/user-area/orders/:id': 'profile_widget_orders',
  '/checkout': 'checkout_widget',
  '/checkout/:id': 'checkout_widget',
  '/password-recovery/:token': 'register_widget',
}

let lastRetryId = null

export function initialize() {
  window.zE(() => {
    window.$zopim(setDepartments)
  })
}

export function setLocale(locale) {
  const supportLanguage = getSupportLanguage(locale)

  loader(setLocale, window.zE.setLocale, supportLanguage)
  setHelpCenterSuggestions()
}

export function identify(user) {
  const { name, email } = user

  loader(identify, window.zE.identify, { name, email })
}

const showButtonAndClearRetry = () => {
  window.zE.show && window.zE.show()
  clearTimeout(lastRetryId)
}

export function showButton(pathname) {
  loader(showButton, showButtonAndClearRetry)
  setHelpCenterSuggestions(pathname)
}

const hideButtonAndClearRetry = () => {
  window.zE.hide && window.zE.hide()
  clearTimeout(lastRetryId)
}

export function hideButton() {
  loader(hideButton, hideButtonAndClearRetry)
}

export function openWidget(showFaq = true) {
  loader(openWidget, window.zE.activate)

  if (showFaq) {
    setHelpCenterSuggestions()
  }
}

export function sendMessage(message) {
  loader(sendMessage, window.zE, 'webWidget', 'chat:send', message)
}

export function popoutChatWindow() {
  loader(popoutChatWindow, window.zE, 'webWidget', 'popout')
}

export function logout() {
  loader(logout, window.zE, 'webWidget', 'logout')
}

export function setHelpCenterSuggestions(currentPath = '/') {
  const path = Object.keys(ZENDESK_LABELS).find((pathname) =>
    matchPath(currentPath, { path: pathname, exact: true }),
  )
  setHelpCenterLoader({ labels: [ZENDESK_LABELS[path]] })
}

function setDepartments() {
  const livechat = window.$zopim.livechat || {}

  livechat?.departments?.filter('')
  livechat?.departments?.setVisitorDepartment('ACMO')
}

function setHelpCenterLoader(options) {
  loader(setHelpCenterLoader, window.zE.setHelpCenterSuggestions, options)
}

export function updateSettings(settings) {
  window.zE('webWidget', 'updateSettings', {
    ...settings,
  })
}

function loader(sourceFn, zendeskFn, ...options) {
  if (window.zE && zendeskFn) {
    zendeskFn(...options)
    return
  }

  retry(sourceFn, options)
}

function retry(callback, options) {
  lastRetryId = setTimeout(() => {
    callback(options)
  }, 1000)
}
