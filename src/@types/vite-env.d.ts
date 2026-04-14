/// <reference types="vite/client" />
interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ImportMetaEnv {
  // APP
  readonly VITE_APP_VERSION:
    | `v${number}`
    | `v${number}-canary.${number}-${number}`
    | `${string}-${number}-${number}`

  // UNLEASH
  readonly VITE_UNLEASH_URL: string
  readonly VITE_UNLEASH_TOKEN: string

  // INVOICES PORTAL
  readonly VITE_INVOICES_PORTAL: string
  readonly VITE_INVOICES_PORTAL_REGISTRATION: string

  // GOOGLE
  readonly VITE_GOOGLE_API_KEY: string

  // COOKIES
  readonly VITE_ACCEPTED_COOKIES: string
  readonly VITE_DELIVERY_COOKIE: string
  readonly VITE_USER_INFO: string

  // SENTRY
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_ENVIRONMENT: string

  // ANALYTICS
  readonly VITE_MO_ANALYTICS_URL: string
}
