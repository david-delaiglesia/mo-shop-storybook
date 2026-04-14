import { ANALYTICS_CUSTOM_PROPERTIES } from './constants'
import Amplitude from 'amplitude-js'

import { Cookie } from 'services/cookie'
import { knownFeatureFlags } from 'services/feature-flags'
import { unleashClient } from 'services/feature-flags/FeatureFlagsProvider'
import { MOAnalytics } from 'services/mo-analytics/'
import { Session } from 'services/session'
import { constants } from 'utils/constants'

const APP_VERSION = import.meta.env.VITE_APP_VERSION
const ANALYTICS_ID = import.meta.env.VITE_ANALYTICS_ID
const ANALYTICS_DOMAIN = import.meta.env.VITE_ANALYTICS_DOMAIN
const OPTIMIZE_ID = import.meta.env.VITE_OPTIMIZE_ID
const AMPLITUDE_TOKEN = import.meta.env.VITE_AMPLITUDE_TOKEN
const COOKIE_EXPIRATION = 365

const isMoAnalitycsEnabled = () =>
  unleashClient.isEnabled(knownFeatureFlags.WEB_CUSTOM_EVENT_IMPLEMENTATION)

let isInitialized = false

function initialize() {
  isInitialized = true

  configureAmplitude()

  if (!Cookie.areThirdPartyAccepted()) return

  window.gtag('config', ANALYTICS_ID, {
    optimize_id: OPTIMIZE_ID,
    custom_map: ANALYTICS_CUSTOM_PROPERTIES,
    cookie_domain: ANALYTICS_DOMAIN,
  })
}

function configureAmplitude() {
  const amplitude = Amplitude.getInstance()

  if (amplitude._isInitialized) return

  amplitude.init(AMPLITUDE_TOKEN, null, {
    domain: ANALYTICS_DOMAIN,
    cookieExpiration: COOKIE_EXPIRATION,
    includeUtm: true,
    includeReferrer: true,
    savedMaxCount: 100,
  })
  amplitude.setVersionName(APP_VERSION)
  amplitude.logEvent('app_initialized')
}

function sendInteraction(name, options) {
  if (!isInitialized) {
    initialize()
  }

  const sharedEventUuid = crypto.randomUUID()
  const optionsWithSharedEventId = { ...options, mo_event_id: sharedEventUuid }

  const amplitude = Amplitude.getInstance()
  amplitude.logEvent(name, optionsWithSharedEventId)

  if (isMoAnalitycsEnabled()) {
    MOAnalytics.captureEvent({
      name,
      properties: optionsWithSharedEventId,
    })
  }

  if (!Cookie.areThirdPartyAccepted()) return

  window.gtag('event', name, options)
}

const sendInteractionGTAG = (name, options) => {
  if (!isInitialized) {
    initialize()
  }

  MOAnalytics.captureEvent({
    name,
    properties: options,
  })

  if (!Cookie.areThirdPartyAccepted()) return

  window.gtag('event', name, options)
}
/**
 * @deprecated use Tracker.sendInteraction instead
 */
function sendViewChange(viewName, options) {
  if (!isInitialized) {
    initialize()
  }

  const sharedEventUuid = crypto.randomUUID()
  const optionsWithSharedEventId = { ...options, mo_event_id: sharedEventUuid }

  const amplitude = Amplitude.getInstance()
  amplitude.logEvent(`${viewName}_view`, optionsWithSharedEventId)

  if (isMoAnalitycsEnabled()) {
    MOAnalytics.captureEvent({
      name: `${viewName}_view`,
      properties: optionsWithSharedEventId,
    })
  }

  if (!Cookie.areThirdPartyAccepted()) return

  window.gtag('event', `${viewName}_view`)
  window.gtag('config', ANALYTICS_ID, {
    optimize_id: OPTIMIZE_ID,
    custom_map: ANALYTICS_CUSTOM_PROPERTIES,
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname,
    cookie_domain: ANALYTICS_DOMAIN,
  })
}

const setSuperProperties = () => {
  if (!isInitialized) {
    initialize()
  }

  if (!Cookie.areThirdPartyAccepted()) return

  const {
    warehouse,
    postalCode: postal_code,
    isAuth: identified,
  } = Session.get()
  const lang = getCurrentLanguage()

  window.gtag('set', 'dimension5', warehouse)
  window.gtag('set', 'dimension6', postal_code)
  window.gtag('set', 'dimension7', identified)
  window.gtag('set', 'dimension8', APP_VERSION)
  window.gtag('set', 'dimension9', lang)
}

function setUserProperties(properties) {
  if (!isInitialized) {
    initialize()
  }

  const { warehouse, postalCode } = Session.get()
  const amplitude = Amplitude.getInstance()

  const lang = getCurrentLanguage()

  const userProperties = {
    ...properties,
    lang,
    warehouse,
    postal_code: postalCode,
  }
  amplitude.setUserProperties(userProperties)
}

function getCurrentLanguage() {
  const cookie = Cookie.get(import.meta.env.VITE_USER_INFO)

  if (cookie && cookie.language) {
    return cookie.language
  }

  return constants.DEFAULT_LANGUAGE
}

function resetUserProperties() {
  setUserProperties()
}

function identifyExistingUser(userId) {
  if (!isInitialized) {
    initialize()
  }

  const amplitude = Amplitude.getInstance()
  amplitude.setUserId(userId)

  if (!Cookie.areThirdPartyAccepted()) return

  window.gtag('set', 'dimension20', userId)
}

function registerNewUser(userId) {
  if (!isInitialized) {
    initialize()
  }

  const amplitude = Amplitude.getInstance()
  amplitude.setUserId(userId)

  if (!Cookie.areThirdPartyAccepted()) return

  window.gtag('set', 'dimension20', userId)
}

function logout() {
  const amplitude = Amplitude.getInstance()
  amplitude.setUserId(null)
  resetUserProperties()
}

function getDeviceId() {
  if (!isInitialized) {
    initialize()
  }

  const amplitude = Amplitude.getInstance()
  return amplitude.options.deviceId
}

export function waitForSession(sendEvent) {
  const amplitude = Amplitude.getInstance()
  const sessionId = amplitude.getSessionId()
  if (!sessionId) {
    setTimeout(() => {
      waitForSession(sendEvent)
    }, 500)
    return
  }
  sendEvent()
}

const getUserInfo = () => {
  const amplitude = Amplitude.getInstance()

  const userInfo = {
    sessionId: amplitude.getSessionId(),
    deviceId: amplitude?.options?.deviceId,
    userId: amplitude?.options?.userId,
  }

  return userInfo
}

export const Tracker = {
  initialize,
  sendInteraction,
  sendInteractionGTAG,
  sendViewChange,
  setSuperProperties,
  setUserProperties,
  identifyExistingUser,
  registerNewUser,
  logout,
  waitForSession,
  getDeviceId,
  getUserInfo,
}
