import { MOAnalytics } from '..'

import { activeFeatureFlags } from '__tests__/helpers'

const FIVE_SECONDS = 5000
const EVENTS_LIMIT = 30
const EVENT_CREATED_AT = '2024-01-01T00:00:00.000Z'
const EVENT_CREATED_AT_PLUS_5_SECONDS = '2024-01-01T00:00:05.000Z'

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
})

afterEach(() => {
  resetEventsState()
  vitest.runOnlyPendingTimers()
  vitest.useRealTimers()
  vitest.clearAllMocks()
})

it('should correctly retry failed events with the correct order', async () => {
  global.window.fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: true })

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({
    name: 'first_event',
    properties: { action: 'click', page: 'home' },
  })
  MOAnalytics.captureEvent({
    name: 'second_event',
    properties: { action: 'scroll', page: 'home' },
  })

  await vitest.advanceTimersByTimeAsync(5000)

  expect(global.fetch).toHaveBeenCalledTimes(1)
  expect(global.fetch).toHaveBeenNthCalledWith(
    1,
    '/events/',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        events: [
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT,
            name: 'first_event',
            properties: { action: 'click', page: 'home' },
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT,
            name: 'second_event',
            properties: { action: 'scroll', page: 'home' },
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
        ],
      }),
    }),
  )

  MOAnalytics.captureEvent({
    name: 'third_event',
    properties: { action: 'submit', page: 'checkout' },
  })

  await vitest.advanceTimersByTimeAsync(5000)

  expect(global.fetch).toHaveBeenCalledTimes(2)
  expect(global.fetch).toHaveBeenNthCalledWith(
    2,
    '/events/',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        events: [
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT,
            name: 'first_event',
            properties: { action: 'click', page: 'home' },
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT,
            name: 'second_event',
            properties: { action: 'scroll', page: 'home' },
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT_PLUS_5_SECONDS,
            name: 'third_event',
            properties: { action: 'submit', page: 'checkout' },
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
