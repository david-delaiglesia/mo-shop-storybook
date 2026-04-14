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
  MOAnalytics._flushEventsNumberLimit = EVENTS_LIMIT
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

const createDeferred = <T = void>() => {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

it('should prevent concurrent flushes', async () => {
  const firstFlush = createDeferred<{ ok: boolean }>()

  let fetchCallCount = 0
  global.fetch = vi.fn().mockImplementation(() => {
    fetchCallCount++
    if (fetchCallCount === 1) {
      return firstFlush.promise
    }

    return Promise.resolve({ ok: true })
  })

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  // Trigger flush by reaching the 2 event limit
  MOAnalytics.captureEvent({ name: 'event_1' })
  MOAnalytics.captureEvent({ name: 'event_2' })

  // At this point, first flush is in progress (fetchCallCount = 1)
  expect(MOAnalytics._flushing).toBe(true)

  // Add more events during the flush
  MOAnalytics.captureEvent({ name: 'event_3' })
  MOAnalytics.captureEvent({ name: 'event_4' })

  // Advance timers to trigger interval-based flush
  await vitest.advanceTimersByTimeAsync(5000)

  // Second flush should be prevented by lock (still fetchCallCount = 1)
  expect(MOAnalytics._flushing).toBe(true)

  // Complete the first flush
  firstFlush.resolve({ ok: true })
  await vitest.waitFor(() => expect(MOAnalytics._flushing).toBe(false))
  expect(MOAnalytics._flushing).toBe(false)

  // Now the interval should be able to flush the remaining events
  await vitest.advanceTimersByTimeAsync(5000)

  const secondBatch = JSON.parse(
    (global.fetch as ReturnType<typeof vi.fn>).mock.calls[1][1].body,
  )
  expect(secondBatch.events).toHaveLength(2)
  expect(secondBatch.events[0].name).toBe('event_3')
  expect(secondBatch.events[1].name).toBe('event_4')
})
