import { MOAnalytics } from '..'

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
}

beforeEach(() => {
  resetEventsState()
  vitest.useFakeTimers()
  vitest.setSystemTime(new Date(EVENT_CREATED_AT))
  global.fetch = vitest.fn().mockResolvedValue({ ok: true })
  activeFeatureFlags(['web-custom-event-implementation'])
  vi.spyOn(unleashClient, 'updateToggles').mockResolvedValue()
})

afterEach(() => {
  resetEventsState()
  vitest.runOnlyPendingTimers()
  vitest.useRealTimers()
  vitest.clearAllMocks()
})

it('should NOT call unleashClient.updateToggles() when pathname contains /checkout/', async () => {
  Object.defineProperty(window, 'location', {
    value: { pathname: '/checkout/step-1' },
    writable: true,
  })

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')
  MOAnalytics.captureEvent({ name: 'test_event' })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  expect(unleashClient.updateToggles).not.toHaveBeenCalled()
})

it('should NOT call unleashClient.updateToggles() when pathname contains /orders/', async () => {
  Object.defineProperty(window, 'location', {
    value: { pathname: '/orders/123' },
    writable: true,
  })

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')
  MOAnalytics.captureEvent({ name: 'test_event' })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  expect(unleashClient.updateToggles).not.toHaveBeenCalled()
})

it('should call unleashClient.updateToggles() when pathname does not contain /checkout/ or /orders/', async () => {
  Object.defineProperty(window, 'location', {
    value: { pathname: '/products/shoes' },
    writable: true,
  })

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')
  MOAnalytics.captureEvent({ name: 'test_event' })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  expect(unleashClient.updateToggles).toHaveBeenCalled()
})
