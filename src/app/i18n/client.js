import { initReactI18next } from 'react-i18next'

import { fetchLocaleByLanguage } from './service'
import i18n from 'i18next'

import { Cookie } from 'services/cookie'
import { constants } from 'utils/constants'
import { changeLanguageCookie } from 'utils/cookies'
import { setMomentLocale } from 'utils/dates'
import isDebugEnv, { isTestingEnv } from 'utils/debug'
import { getISOLanguage } from 'utils/languages'

const DEFAULT_LANGUAGE = constants.DEFAULT_LANGUAGE
const DEFAULT_NAMESPACE = 'translation'

async function create() {
  if (i18n.isInitialized) return

  const initialLanguage = getLanguageCookie()
  return init(initialLanguage)
}

function getLanguageCookie() {
  const cookie = Cookie.get(import.meta.env.VITE_USER_INFO)

  if (cookie && cookie.language) {
    return cookie.language
  }

  return DEFAULT_LANGUAGE
}

async function init(initialLanguage) {
  const options = {
    fallbackLng: DEFAULT_LANGUAGE,
    lng: initialLanguage,
    resources: {
      [initialLanguage]: {
        translation: await fetchLocaleByLanguage(initialLanguage),
      },
      ...(DEFAULT_LANGUAGE !== initialLanguage && {
        [DEFAULT_LANGUAGE]: {
          translation: await fetchLocaleByLanguage(DEFAULT_LANGUAGE),
        },
      }),
    },
    debug: isDebugEnv() && !isTestingEnv(),

    interpolation: {
      escapeValue: false,
    },

    react: {
      eventsToListen: ['languageChanged'],
    },
  }

  updateLanguage(initialLanguage)

  return i18n.use(initReactI18next).init(options)
}

function updateLanguage(language) {
  setMomentLocale(language)
  setHtmlLanguage(language)
}

function setHtmlLanguage(language) {
  document.documentElement.lang = language
}

async function changeLanguage(language) {
  const validLanguage = getISOLanguage(language)

  const hasResourceAlready = i18n.hasResourceBundle(
    validLanguage,
    DEFAULT_NAMESPACE,
  )
  if (!hasResourceAlready) {
    i18n.addResourceBundle(
      validLanguage,
      DEFAULT_NAMESPACE,
      await fetchLocaleByLanguage(language),
    )
  }

  changeLanguageCookie(language)
  updateLanguage(language)

  return i18n.changeLanguage(validLanguage)
}

function getInstance() {
  return i18n
}

function t(keys, options) {
  return i18n.t(keys, options)
}

function getCurrentLanguage() {
  const initialLanguage = getLanguageCookie()
  if (!i18n.isInitialized) {
    return initialLanguage
  }

  return getISOLanguage(i18n.language)
}

const I18nClient = {
  create,
  changeLanguage,
  getInstance,
  t,
  getCurrentLanguage,
}

export { I18nClient }
