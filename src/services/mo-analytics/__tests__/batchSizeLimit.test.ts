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

it('should flush only the batch size limit when queue has more events than limit after failure', async () => {
  global.fetch = vi
    .fn()
    .mockResolvedValueOnce({ ok: false, status: 500 })
    .mockResolvedValue({ ok: true })

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })
  MOAnalytics.captureEvent({ name: 'event_3' })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

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

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  expect(global.fetch).toHaveBeenNthCalledWith(
    3,
    '/events/',
    expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        events: [
          {
            id: '10000000-1000-4000-8000-100000000000',
            user_id: '1',
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
