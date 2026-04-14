import { constants } from './constants'

export const ZENDESK_ENGLISH_ISO = 'en-us'

export const LANGUAGES = {
  ES: 'es',
  VA: 'vai',
  CA: 'ca',
  EN: 'en',
  EU: 'eu',
}

export function getISOLanguage(language) {
  const { VA, CA, EN, EU, ES } = LANGUAGES
  const mapping = {
    va: VA,
    vai: VA,
    ca: CA,
    en: EN,
    eu: EU,
    es: ES,
  }

  return mapping[language] || constants.DEFAULT_LANGUAGE
}

export function getSupportLanguage(locale) {
  const { EN, VA, ES } = LANGUAGES

  if (locale === EN) {
    return ZENDESK_ENGLISH_ISO
  }

  if (locale === VA) {
    return ES
  }

  return locale
}
