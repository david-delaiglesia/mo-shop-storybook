import { getISOLanguage } from 'utils/languages'

export async function fetchLocaleByLanguage(language) {
  const validLanguage = getISOLanguage(language)

  try {
    const localeResource = await fetch(`/locales/${validLanguage}.json`)
    const locales = await localeResource.json()
    return locales
  } catch {
    return {}
  }
}
