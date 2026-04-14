import { vi } from 'vitest'

vi.mock('react-i18next', async (importOriginal) => {
  const originalModule = await importOriginal()

  return {
    ...originalModule,
    useTranslation: () => ({
      t: (key) => key,
    }),
  }
})

vi.mock('app/i18n/service', () => {
  const locale = vi.importActual('./../../../../public/locales/en')
  return { fetchLocaleByLanguage: () => Promise.resolve(locale) }
})

vi.mock('../client', () => ({
  I18nClient: {
    create: () => undefined,
    changeLanguage: () => undefined,
    getInstance: () => ({
      options: {
        defaultNS: ['translation'],
      },
      getFixedT: () => (key, value) => {
        if (value) {
          return `${key} ${JSON.stringify(value)}`
        }

        return key
      },
      loadNamespaces: () => () => ({}),
    }),
    t: (key) => key,
    getCurrentLanguage: () => 'es',
  },
}))
