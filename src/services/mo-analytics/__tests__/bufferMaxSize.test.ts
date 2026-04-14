import { MOAnalytics } from '..'
import { monitoring } from 'monitoring'

import { activeFeatureFlags } from '__tests__/helpers'

const FIVE_SECONDS = 5000
const EVENT_CREATED_AT = '2024-01-01T00:00:00.000Z'
const EVENT_CREATED_AT_PLUS_5_SECONDS = '2024-01-01T00:00:05.000Z'
const EVENT_CREATED_AT_PLUS_10_SECONDS = '2024-01-01T00:00:10.000Z'

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

it('should drop oldest events when queue exceeds limit (basic drop behavior)', async () => {
  global.fetch = vi.fn().mockResolvedValueOnce({ ok: true })

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: 30,
    eventsBufferMaxSize: 2,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })
  MOAnalytics.captureEvent({ name: 'event_3' })
  MOAnalytics.captureEvent({ name: 'event_4' })
  MOAnalytics.captureEvent({ name: 'event_5' })
  MOAnalytics.captureEvent({ name: 'event_6' })

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
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT,
            name: 'event_5',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT,
            name: 'event_6',
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

it('should only send newest events after drop when flush succeeds', async () => {
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: true })

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: 30,
    eventsBufferMaxSize: 4,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })
  await vitest.advanceTimersByTimeAsync(5000)
  // event_1 and event_2 fails

  MOAnalytics.captureEvent({ name: 'event_3' })
  MOAnalytics.captureEvent({ name: 'event_4' })
  await vitest.advanceTimersByTimeAsync(5000)
  // event_3 and event_4 fails

  MOAnalytics.captureEvent({ name: 'event_5' })
  await vitest.advanceTimersByTimeAsync(5000)
  // event_5 forces the drop of event_1

  expect(global.fetch).toHaveBeenNthCalledWith(
    3,
    '/events/',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        events: [
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT,
            name: 'event_2',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT_PLUS_5_SECONDS,
            name: 'event_3',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT_PLUS_5_SECONDS,
            name: 'event_4',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT_PLUS_10_SECONDS,
            name: 'event_5',
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

it('should not drop events when queue is under limit', async () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: 30,
    eventsBufferMaxSize: 10,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })
  MOAnalytics.captureEvent({ name: 'event_3' })

  await vitest.advanceTimersByTimeAsync(5000)

  expect(global.fetch).toHaveBeenCalledWith(
    '/events/',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        events: [
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
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
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT,
            name: 'event_2',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT,
            name: 'event_3',
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

it('should drop at exact limit threshold', () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: 30,
    eventsBufferMaxSize: 3,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })
  MOAnalytics.captureEvent({ name: 'event_3' })

  expect(MOAnalytics._queue).toHaveLength(3)

  MOAnalytics.captureEvent({ name: 'event_4' })

  expect(MOAnalytics._queue).toHaveLength(3)
  expect(MOAnalytics._queue[0].name).toBe('event_2')
  expect(MOAnalytics._queue[1].name).toBe('event_3')
  expect(MOAnalytics._queue[2].name).toBe('event_4')
})

it('should maintain limit across multiple failed flush cycles', async () => {
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValueOnce({ ok: true })

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: 30,
    eventsBufferMaxSize: 3,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })
  MOAnalytics.captureEvent({ name: 'event_3' })
  await vitest.advanceTimersByTimeAsync(5000)
  // First flush fails with event_1, event_2, event_3

  MOAnalytics.captureEvent({ name: 'event_4' })
  MOAnalytics.captureEvent({ name: 'event_5' })
  MOAnalytics.captureEvent({ name: 'event_6' })
  // Drops event_1, event_2, event_3
  await vitest.advanceTimersByTimeAsync(5000)
  // Second flush fails with event_4, event_5, event_6

  await vitest.advanceTimersByTimeAsync(5000)
  // Third flush succeeds

  expect(global.fetch).toHaveBeenNthCalledWith(
    3,
    '/events/',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        events: [
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT_PLUS_5_SECONDS,
            name: 'event_4',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT_PLUS_5_SECONDS,
            name: 'event_5',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: 'user-123',
            occurred_at: EVENT_CREATED_AT_PLUS_5_SECONDS,
            name: 'event_6',
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

it('should capture error when dropping events from queue', () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: 30,
    eventsBufferMaxSize: 3,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })
  MOAnalytics.captureEvent({ name: 'event_3' })

  // this triggers the first drop
  MOAnalytics.captureEvent({ name: 'event_4' })

  expect(monitoring.captureError).toHaveBeenCalledWith(
    new Error(
      '[MOAnalytics] dropped 1 events (queue exceeded maxQueueSize). droppedCount=1 bufferMaxSize=3 queueLength=3',
    ),
  )

  // this triggers another drop
  MOAnalytics.captureEvent({ name: 'event_5' })

  expect(monitoring.captureError).toHaveBeenCalledWith(
    new Error(
      '[MOAnalytics] dropped 1 events (queue exceeded maxQueueSize). droppedCount=1 bufferMaxSize=3 queueLength=3',
    ),
  )
})
