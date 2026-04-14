import { MOAnalytics } from '..'
import { monitoring } from 'monitoring'

import { activeFeatureFlags } from '__tests__/helpers'

const FIVE_SECONDS = 5000

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
  global.fetch = vitest.fn().mockRejectedValue(new Error('Network error'))
  activeFeatureFlags(['web-custom-event-implementation'])
})

afterEach(() => {
  resetEventsState()
  vitest.runOnlyPendingTimers()
  vitest.useRealTimers()
  vitest.clearAllMocks()
})

it('should not call monitoring.captureError when flag is OFF even if queue is near limit', async () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: 2,
    eventsBufferMaxSize: 3,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  expect(monitoring.captureError).not.toHaveBeenCalled()
})

it('should not call monitoring.captureError when flag is ON but queue is below threshold', async () => {
  activeFeatureFlags([
    'web-custom-event-implementation',
    'web-mo-analytics-flush-error-monitoring',
  ])

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: 1,
    eventsBufferMaxSize: 3,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({ name: 'event_1' })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  expect(monitoring.captureError).not.toHaveBeenCalled()
})

it('should call monitoring.captureError when flag is ON and queue is at threshold and flush fails', async () => {
  const fetchError = new Error('Connection refused')
  global.fetch = vitest.fn().mockRejectedValue(fetchError)
  activeFeatureFlags([
    'web-custom-event-implementation',
    'web-mo-analytics-flush-error-monitoring',
  ])

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: 2,
    eventsBufferMaxSize: 3,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  expect(monitoring.captureError).toHaveBeenCalledWith(
    expect.objectContaining({
      message: '[MOAnalytics] flush failed near buffer limit',
      cause: fetchError,
    }),
  )
})

it('should not call monitoring.captureError when flush succeeds even if queue is near limit', async () => {
  global.fetch = vitest.fn().mockResolvedValue({ ok: true })
  activeFeatureFlags([
    'web-custom-event-implementation',
    'web-mo-analytics-flush-error-monitoring',
  ])

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: 2,
    eventsBufferMaxSize: 3,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  expect(monitoring.captureError).not.toHaveBeenCalled()
})
