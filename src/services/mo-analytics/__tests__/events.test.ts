import { MOAnalytics } from '../'

import { activeFeatureFlags } from '__tests__/helpers'

const FIVE_SECONDS = 5000
const EVENTS_LIMIT = 30
const EVENT_CREATED_AT = '2024-01-01T00:00:00.000Z'
const EVENT_CREATED_AT_PLUS_INTERVAL_TIMEOUT = '2024-01-01T00:00:05.000Z'

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

it('should retry sending events that failed, included in the next cycle', async () => {
  global.window.fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 500 })

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')
  MOAnalytics.captureEvent({
    name: 'first_event',
  })

  await vitest.advanceTimersByTimeAsync(5000)

  MOAnalytics.captureEvent({
    name: 'second_event',
  })

  await vitest.advanceTimersByTimeAsync(5000)

  expect(global.fetch).toHaveBeenNthCalledWith(
    2,
    '/events/',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        events: [
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: '1',
            occurred_at: EVENT_CREATED_AT,
            name: 'first_event',
            properties: {},
            user_properties: {
              version: 'v0',
              platform: 'web',
            },
          },
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: '1',
            occurred_at: EVENT_CREATED_AT_PLUS_INTERVAL_TIMEOUT,
            name: 'second_event',
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

describe('if a user was logged in when the event was triggered and then he logs out', async () => {
  it('should send the event with the user id', async () => {
    MOAnalytics._init({
      apiUrl: '/events/',
      flushIntervalMs: FIVE_SECONDS,
      flushEventsNumberLimit: EVENTS_LIMIT,
    })
    MOAnalytics.setUserId('1')

    MOAnalytics.captureEvent({
      name: 'add_product_click',
    })

    MOAnalytics.anonymize()

    await vitest.advanceTimersByTimeAsync(5000)

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
              name: 'add_product_click',
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
})

it('should send event to the correct API URL', async () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({
    name: 'add_product_click',
  })

  await vitest.advanceTimersByTimeAsync(5000)

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
            name: 'add_product_click',
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

it('should NOT send event before 5 seconds', async () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({
    name: 'add_product_click',
  })

  await vitest.advanceTimersByTimeAsync(4000)

  expect(global.fetch).not.toHaveBeenCalled()
})

it('should not send events when the queue is empty', async () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })

  await vitest.advanceTimersByTimeAsync(5000)

  expect(global.fetch).not.toHaveBeenCalled()
})

it('should batch events every 5 seconds and only send new events in the next window', async () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({ name: 'first_event' })
  MOAnalytics.captureEvent({ name: 'second_event' })

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
            user_id: '1',
            occurred_at: EVENT_CREATED_AT,
            name: 'first_event',
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
            name: 'second_event',
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

  MOAnalytics.captureEvent({ name: 'third_event' })

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
            user_id: '1',
            occurred_at: EVENT_CREATED_AT_PLUS_INTERVAL_TIMEOUT,
            name: 'third_event',
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

it('should capture and send events for non-logged users', async () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })

  MOAnalytics.captureEvent({ name: 'anonymous_event' })

  expect(MOAnalytics._queue).toHaveLength(1)

  await vitest.advanceTimersByTimeAsync(5000)

  expect(global.fetch).toHaveBeenCalledWith(
    '/events/',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        events: [
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: null,
            occurred_at: EVENT_CREATED_AT,
            name: 'anonymous_event',
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

// TODO: remove when FF is removed
it('should not send events when the queue is empty if web-custom-event-implementation FF is disabled', async () => {
  activeFeatureFlags([])
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })

  await vitest.advanceTimersByTimeAsync(5000)

  expect(global.fetch).not.toHaveBeenCalled()
})

// TODO: remove when FF is removed
it('should NOT batch events every 5 seconds and only send new events in the next window if web-custom-event-implementation FF is disabled', async () => {
  activeFeatureFlags([])

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({ name: 'first_event' })
  MOAnalytics.captureEvent({ name: 'second_event' })

  await vitest.advanceTimersByTimeAsync(5000)

  expect(global.fetch).not.toHaveBeenCalled()

  MOAnalytics.captureEvent({ name: 'third_event' })

  await vitest.advanceTimersByTimeAsync(5000)

  expect(global.fetch).not.toHaveBeenCalled()
})

// TODO: remove when FF is removed
it('should NOT capture events for non-logged users if FF web-custom-event-implementation is disabled', () => {
  activeFeatureFlags([])
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })

  MOAnalytics.captureEvent({ name: 'first_event' })

  expect(MOAnalytics._queue).toHaveLength(0)
})

// TODO: remove when FF is removed
it('should NOT send events for non-logged users if FF web-custom-event-implementation is disabled', async () => {
  activeFeatureFlags([])
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })

  MOAnalytics.captureEvent({ name: 'first_event' })

  await vitest.advanceTimersByTimeAsync(5000)

  expect(global.fetch).not.toHaveBeenCalled()
})

it('should send events with user_id when user is logged in', async () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({ name: 'logged_event' })

  await vitest.advanceTimersByTimeAsync(5000)

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
            name: 'logged_event',
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
