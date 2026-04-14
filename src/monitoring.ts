import { AppConfig } from 'config'
import { UnleashClient } from 'unleash-proxy-client'

import { Monitoring, SentryTransport } from '@mercadona/mo.library.monitoring'

import { FlagsClient, knownFeatureFlags } from 'services/feature-flags'

export const sentryTransport = new SentryTransport({
  dsn: AppConfig.SENTRY_DSN,
  release: AppConfig.APP_VERSION,
  environment: AppConfig.SENTRY_ENVIRONMENT,
  enabled: import.meta.env.PROD,
  sampleRate: 0.1,
  tracesSampleRate: 0.01,
  tracePropagationTargets: [],
  ignoreErrors: [
    'TypeError: NetworkError when attempting to fetch resource.',
    'TypeError: cancelado',
    "Can't find variable: gmo",
    'Non-Error promise rejection captured with value: Timeout',
    'ResizeObserver loop completed with undelivered notifications.',
    "Failed to register a ServiceWorker for scope ('https://tienda.mercadona.es/') with script ('https://tienda.mercadona.es/service-worker.js'): An unknown error occurred when fetching the script.",
  ],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // TODO: Review this before send
  beforeSend(event) {
    try {
      if (event.contexts && event.contexts.os) {
        const { name } = event.contexts.os
        if (name === 'iOS' || name === 'Android') {
          return null
        }
      }
      //TODO remove this code when upgrading the @sentry/react libary
      if (event?.request?.headers?.['User-Agent']) {
        const userAgent = event.request.headers['User-Agent']
        if (userAgent.includes('iPhone') || userAgent.includes('Android')) {
          return null
        }
      }
      const errorMessage = event.exception?.values?.[0]?.value ?? ''
      if (
        errorMessage.includes('startTs') &&
        FlagsClient.isEnabled(knownFeatureFlags.AKAMAI_STARTTS_MONITORING)
      ) {
        monitoring.sendMessage('akamai_startts_error', {
          visibility: document.visibilityState,
          time_since_load: Math.round(performance.now()),
          referrer: document.referrer,
        })
      }
    } catch (error) {
      console.error(error, event)
    }
    return event
  },

  integrations: [
    SentryTransport.Sentry.unleashIntegration({
      featureFlagClientClass: UnleashClient,
    }),
  ],
})

export const monitoring = new Monitoring({
  transports: [sentryTransport],
})
