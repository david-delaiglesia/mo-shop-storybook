import {
  EVENTS_BATCH_LIMIT,
  EVENTS_BUFFER_MAX_SIZE,
  INTERVAL_TIME,
} from './constants'
import { MOAnalytics } from './mo-analytics'

import { unleashClient } from 'services/feature-flags/FeatureFlagsProvider'

export async function initializeEventsWithUnleash(apiUrl: string) {
  try {
    await new Promise((resolve, reject) => {
      unleashClient.on('ready', resolve)
      unleashClient.on('error', reject)
    })

    const flushEventsNumberLimit =
      Number(
        unleashClient.getVariant('moanalytics_batch_size')?.payload?.value,
      ) || EVENTS_BATCH_LIMIT

    const flushIntervalMs =
      Number(
        unleashClient.getVariant('moanalytics_send_interval_seconds')?.payload
          ?.value,
      ) * 1000 || INTERVAL_TIME

    const eventsBufferMaxSize =
      Number(
        unleashClient.getVariant('moanalytics_max_queue_size')?.payload?.value,
      ) || EVENTS_BUFFER_MAX_SIZE

    MOAnalytics._init({
      apiUrl,
      flushIntervalMs,
      flushEventsNumberLimit,
      eventsBufferMaxSize,
    })
  } catch {
    MOAnalytics._init({
      apiUrl,
      flushIntervalMs: INTERVAL_TIME,
      flushEventsNumberLimit: EVENTS_BATCH_LIMIT,
      eventsBufferMaxSize: EVENTS_BUFFER_MAX_SIZE,
    })
  }
}
