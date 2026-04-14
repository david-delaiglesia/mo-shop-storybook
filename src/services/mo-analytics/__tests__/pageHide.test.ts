import { MOAnalytics } from '..'
import { EVENTS_LOCAL_STORAGE_KEY } from '../constants'
import { monitoring } from 'monitoring'

import { activeFeatureFlags } from '__tests__/helpers'
import { unleashClient } from 'services/feature-flags/FeatureFlagsProvider'

const FIVE_SECONDS = 5000
const EVENTS_LIMIT = 30
const EVENT_CREATED_AT = '2024-01-01T00:00:00.000Z'

const resetEventsState = () => {
  if (MOAnalytics._intervalId) {
    clearInterval(MOAnalytics._intervalId)
  }

  MOAnalytics._userId = ''
  MOAnalytics._intervalId = null
  MOAnalytics._queue = []
  MOAnalytics._url = ''
  MOAnalytics._flushing = false
  MOAnalytics._flushEventsNumberLimit = 30
  MOAnalytics._eventsBufferMaxSize = 300
  MOAnalytics._pageHideListenerRegistered = false
}

beforeEach(() => {
  resetEventsState()
  localStorage.clear()
  vitest.useFakeTimers()
  vitest.setSystemTime(new Date(EVENT_CREATED_AT))
  global.fetch = vitest.fn().mockResolvedValue({ ok: true })
  global.navigator.sendBeacon = vitest.fn()
  activeFeatureFlags(['web-custom-event-implementation'])
  vi.spyOn(unleashClient, 'updateToggles').mockResolvedValue()
  vi.spyOn(window, 'addEventListener')
  vi.spyOn(window, 'removeEventListener')
})

afterEach(() => {
  resetEventsState()
  localStorage.clear()
  vitest.runOnlyPendingTimers()
  vitest.useRealTimers()
  vitest.clearAllMocks()
})

it('registers the pagehide listener when _init is called', () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })

  expect(window.addEventListener).toHaveBeenCalledWith(
    'pagehide',
    expect.any(Function),
  )
  expect(MOAnalytics._pageHideListenerRegistered).toBe(true)
})

it('does not register the pagehide listener twice if _init is called twice', () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })

  expect(window.addEventListener).toHaveBeenCalledTimes(1)
})

it('sends all queued events via sendBeacon when pagehide fires and flag is enabled', async () => {
  const EVENT_CREATED_AT_PLUS_5_SECONDS = '2024-01-01T00:00:05.000Z'

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  vitest.setSystemTime(new Date(EVENT_CREATED_AT_PLUS_5_SECONDS))
  MOAnalytics.captureEvent({ name: 'pending_event' })
  window.dispatchEvent(new Event('pagehide'))

  expect(navigator.sendBeacon).toHaveBeenCalledWith(
    '/events/',
    JSON.stringify({
      events: [
        {
          id: '10000000-1000-4000-8000-100000000000',
          user_id: '1',
          occurred_at: EVENT_CREATED_AT_PLUS_5_SECONDS,
          name: 'pending_event',
          properties: {},
          user_properties: {
            version: 'v0',
            platform: 'web',
          },
        },
      ],
    }),
  )
  expect(MOAnalytics._queue).toHaveLength(0)
})

it('does not call sendBeacon when the queue is empty on pagehide', async () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  window.dispatchEvent(new Event('pagehide'))

  expect(navigator.sendBeacon).not.toHaveBeenCalled()
})

it('saves events to localStorage when page is reloaded and recovery flag is enabled', async () => {
  activeFeatureFlags(['web-custom-event-implementation'])
  vi.spyOn(performance, 'getEntriesByType').mockReturnValue([
    { type: 'reload' } as PerformanceNavigationTiming,
  ])

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')
  MOAnalytics.captureEvent({ name: 'pending_event' })

  window.dispatchEvent(new Event('pagehide'))

  const saved = JSON.parse(localStorage.getItem(EVENTS_LOCAL_STORAGE_KEY)!)
  expect(saved).toHaveLength(1)
  expect(saved[0]).toMatchObject({ name: 'pending_event' })
  expect(navigator.sendBeacon).not.toHaveBeenCalled()
})

it('saves events to localStorage using the legacy navigation API when page is reloaded', () => {
  activeFeatureFlags(['web-custom-event-implementation'])

  const originalNavigation = Object.getOwnPropertyDescriptor(
    performance,
    'navigation',
  )
  Object.defineProperty(performance, 'navigation', {
    value: { type: 1 },
    configurable: true,
    writable: true,
  })

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')
  MOAnalytics.captureEvent({ name: 'pending_event' })

  window.dispatchEvent(new Event('pagehide'))

  const saved = JSON.parse(localStorage.getItem(EVENTS_LOCAL_STORAGE_KEY)!)
  expect(saved).toHaveLength(1)
  expect(saved[0]).toMatchObject({ name: 'pending_event' })
  expect(navigator.sendBeacon).not.toHaveBeenCalled()

  if (originalNavigation) {
    Object.defineProperty(performance, 'navigation', originalNavigation)
  } else {
    Object.defineProperty(performance, 'navigation', {
      value: undefined,
      configurable: true,
      writable: true,
    })
  }
})

it('logs a monitoring message when the legacy navigation API is used to check reload', () => {
  activeFeatureFlags(['web-custom-event-implementation'])
  vi.spyOn(performance, 'getEntriesByType').mockReturnValue([])

  const originalNavigation = Object.getOwnPropertyDescriptor(
    performance,
    'navigation',
  )
  Object.defineProperty(performance, 'navigation', {
    value: { type: 1 },
    configurable: true,
    writable: true,
  })

  try {
    MOAnalytics._init({
      apiUrl: '/events/',
      flushIntervalMs: FIVE_SECONDS,
      flushEventsNumberLimit: EVENTS_LIMIT,
    })
    MOAnalytics.setUserId('1')
    MOAnalytics.captureEvent({ name: 'pending_event' })

    window.dispatchEvent(new Event('pagehide'))

    expect(monitoring.sendMessage).toHaveBeenCalledWith(
      '[MOAnalytics] checking reload using the fallback method',
    )
  } finally {
    if (originalNavigation) {
      Object.defineProperty(performance, 'navigation', originalNavigation)
    } else {
      Object.defineProperty(performance, 'navigation', {
        value: undefined,
        configurable: true,
        writable: true,
      })
    }
  }
})
