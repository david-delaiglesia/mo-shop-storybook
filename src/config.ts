import { getNumericAppVersion } from 'utils/version'

export const AppConfig = {
  // APP
  APP_NAME: 'shop-web',
  APP_VERSION: import.meta.env.VITE_APP_VERSION,
  APP_VERSION_NUMBER: getNumericAppVersion(import.meta.env.VITE_APP_VERSION),

  // UNLEASH
  UNLEASH_URL: import.meta.env.VITE_UNLEASH_URL,
  UNLEASH_TOKEN: import.meta.env.VITE_UNLEASH_TOKEN,

  // INVOICES PORTAL
  INVOICES_PORTAL: import.meta.env.VITE_INVOICES_PORTAL,
  INVOICES_PORTAL_REGISTRATION: import.meta.env
    .VITE_INVOICES_PORTAL_REGISTRATION,

  // GOOGLE
  GOOGLE_API_KEY: import.meta.env.VITE_GOOGLE_API_KEY,

  // SENTRY
  SENTRY_DSN: import.meta.env.VITE_SENTRY_DSN,
  SENTRY_ENVIRONMENT: import.meta.env.VITE_SENTRY_ENVIRONMENT,

  // ANALYTICS
  MO_ANALYTICS_URL: import.meta.env.VITE_MO_ANALYTICS_URL,
}
