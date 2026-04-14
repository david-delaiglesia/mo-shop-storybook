import {
  EVENTS_BATCH_LIMIT,
  EVENTS_BUFFER_MAX_SIZE,
  INTERVAL_TIME,
} from './constants'
import { initializeEventsWithUnleash } from './initializer'
import { Event, EventWithUserId } from './interfaces'
import { Persistence } from './persistence'
import { getMetricsPayload, wasPageReloaded } from './utils'
import { monitoring } from 'monitoring'

import { knownFeatureFlags } from 'services/feature-flags'
import { unleashClient } from 'services/feature-flags/FeatureFlagsProvider'

interface EventsInitConfig {
  apiUrl: string
  flushIntervalMs: number
  flushEventsNumberLimit: number
  eventsBufferMaxSize?: number
}

const isFeatureEnabled = () =>
  unleashClient.isEnabled(knownFeatureFlags.WEB_CUSTOM_EVENT_IMPLEMENTATION)

const isFlushErrorMonitoringEnabled = () =>
  unleashClient.isEnabled(
    knownFeatureFlags.WEB_MO_ANALYTICS_FLUSH_ERROR_MONITORING,
  )

const handlePageClose = () => {
  if (events._queue.length === 0) return

  if (wasPageReloaded()) {
    Persistence.save(events._queue)
    return
  }

  navigator.sendBeacon(
    events._url,
    JSON.stringify(getMetricsPayload(events._queue)),
  )

  events._queue = []
}

const flushEvents = async () => {
  const pathname = window.location.pathname
  if (!pathname.includes('/checkout/') && !pathname.includes('/orders/')) {
    unleashClient.updateToggles()
  }

  if (!isFeatureEnabled()) {
    return
  }

  if (events._flushing) {
    return
  }

  if (events._queue.length === 0) {
    return
  }

  events._flushing = true

  const eventsToFlush = events._queue.slice(0, events._flushEventsNumberLimit)
  const metricsPayload = getMetricsPayload(eventsToFlush)

  try {
    const response = await fetch(events._url, {
      method: 'POST',
      body: JSON.stringify(metricsPayload),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Analytics service failed with status ${response.status}`)
    }

    events._queue = events._queue.slice(events._flushEventsNumberLimit)
  } catch (error) {
    if (
      isFlushErrorMonitoringEnabled() &&
      events._queue.length >= events._eventsBufferMaxSize - 1
    ) {
      monitoring.captureError(
        // @ts-expect-error -- Error cause option requires ES2022 lib, remove when tsconfig is updated
        new Error('[MOAnalytics] flush failed near buffer limit', {
          cause: error,
        }),
      )
    }
  } finally {
    events._flushing = false
  }
}

const events = {
  _url: '',
  _queue: [] as EventWithUserId[],
  _intervalId: null as ReturnType<typeof setInterval> | null,
  _userId: undefined as string | undefined,
  _flushing: false,
  _pageHideListenerRegistered: false,
  _flushEventsNumberLimit: EVENTS_BATCH_LIMIT,
  _eventsBufferMaxSize: EVENTS_BUFFER_MAX_SIZE,

  init: (apiUrl: string) => {
    initializeEventsWithUnleash(apiUrl)
  },

  _init: ({
    apiUrl,
    flushIntervalMs = INTERVAL_TIME,
    flushEventsNumberLimit = EVENTS_BATCH_LIMIT,
    eventsBufferMaxSize = EVENTS_BUFFER_MAX_SIZE,
  }: EventsInitConfig) => {
    events._url = apiUrl
    events._flushEventsNumberLimit = flushEventsNumberLimit
    events._eventsBufferMaxSize = eventsBufferMaxSize

    if (!events._intervalId) {
      events._intervalId = setInterval(flushEvents, flushIntervalMs)
    }

    if (!events._pageHideListenerRegistered) {
      window.addEventListener('pagehide', handlePageClose)
      events._pageHideListenerRegistered = true
    }
  },

  setUserId: (userId: string) => {
    events._userId = userId
  },

  anonymize: () => {
    events._userId = undefined
  },

  captureEvent: (event: Event) => {
    if (!isFeatureEnabled()) {
      return
    }

    const savedEvents = Persistence.load()
    if (savedEvents.length > 0) {
      events._queue = [...savedEvents, ...events._queue]
      Persistence.clear()
    }

    const userId = events._userId

    const eventWithUserId = {
      ...event,
      id: crypto.randomUUID(),
      userId: userId || null,
      occurredAt: new Date().toISOString(),
    }

    events._queue.push(eventWithUserId)

    if (events._queue.length > events._eventsBufferMaxSize) {
      const droppedCount = events._queue.length - events._eventsBufferMaxSize
      events._queue = events._queue.slice(-events._eventsBufferMaxSize)
      monitoring.captureError(
        new Error(
          `[MOAnalytics] dropped ${droppedCount} events (queue exceeded maxQueueSize). droppedCount=${droppedCount} bufferMaxSize=${events._eventsBufferMaxSize} queueLength=${events._queue.length}`,
        ),
      )
    }

    if (events._queue.length >= events._flushEventsNumberLimit) {
      flushEvents()
    }
  },
}

export { events as MOAnalytics }
