import { MOAnalytics } from '..'

import { activeFeatureFlags } from '__tests__/helpers'

const FIVE_SECONDS = 5000
const EVENTS_LIMIT = 2
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
  MOAnalytics._flushEventsNumberLimit = 2
  MOAnalytics._eventsBufferMaxSize = 300
}

beforeEach(() => {
  resetEventsState()
  vitest.useFakeTimers()
  vitest.setSystemTime(new Date(EVENT_CREATED_AT))
  global.fetch = vitest.fn()
  activeFeatureFlags(['web-custom-event-implementation'])
})

afterEach(() => {
  resetEventsState()
  vitest.runOnlyPendingTimers()
  vitest.useRealTimers()
  vitest.clearAllMocks()
})

it('should flush events immediately when queue reaches exactly 2 events', async () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })

  expect(global.fetch).toHaveBeenCalledTimes(1)
  expect(global.fetch).toHaveBeenCalledWith(
    '/events/',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        events: [
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: '1',
            occurred_at: EVENT_CREATED_AT,
            name: 'event_1',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: '1',
            occurred_at: EVENT_CREATED_AT,
            name: 'event_2',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
        ],
      }),
    }),
  )
})

it('should NOT flush events immediately when queue has only 1 event', async () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({ name: 'event_1' })

  expect(global.fetch).toHaveBeenCalledTimes(0)

  await vitest.advanceTimersByTimeAsync(5000)

  expect(global.fetch).toHaveBeenCalledTimes(1)
  expect(global.fetch).toHaveBeenCalledWith(
    '/events/',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        events: [
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: '1',
            occurred_at: EVENT_CREATED_AT,
            name: 'event_1',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
        ],
      }),
    }),
  )
})

it('should handle flush failure with fire-and-forget strategy and retry on next interval', async () => {
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: true })

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })

  expect(global.fetch).toHaveBeenCalledTimes(1)

  await vitest.advanceTimersByTimeAsync(5000)

  expect(global.fetch).toHaveBeenCalledTimes(2)
  expect(global.fetch).toHaveBeenCalledWith(
    '/events/',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        events: [
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: '1',
            occurred_at: EVENT_CREATED_AT,
            name: 'event_1',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: '1',
            occurred_at: EVENT_CREATED_AT,
            name: 'event_2',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
        ],
      }),
    }),
  )
})
