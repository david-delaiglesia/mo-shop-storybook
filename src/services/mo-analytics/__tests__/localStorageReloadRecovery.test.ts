import { MOAnalytics } from '..'
import { EVENTS_LOCAL_STORAGE_KEY } from '../constants'
import { monitoring } from 'monitoring'

import { activeFeatureFlags } from '__tests__/helpers'

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
  activeFeatureFlags(['web-custom-event-implementation'])
})

afterEach(() => {
  resetEventsState()
  localStorage.clear()
  vitest.runOnlyPendingTimers()
  vitest.useRealTimers()
  vitest.clearAllMocks()
})

it('merges localStorage events into the queue before the new event', () => {
  const savedEvent = {
    id: 'saved-event-id',
    name: 'saved_event',
    userId: '1',
    occurredAt: '2023-12-31T00:00:00.000Z',
    properties: {},
  }
  localStorage.setItem(EVENTS_LOCAL_STORAGE_KEY, JSON.stringify([savedEvent]))

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({ name: 'new_event' })

  expect(MOAnalytics._queue[0]).toMatchObject({
    name: 'saved_event',
    id: 'saved-event-id',
  })
  expect(MOAnalytics._queue[1]).toMatchObject({ name: 'new_event' })
})

it('clears localStorage after merging events', () => {
  const savedEvent = {
    id: 'saved-event-id',
    name: 'saved_event',
    userId: '1',
    occurredAt: '2023-12-31T00:00:00.000Z',
    properties: {},
  }
  localStorage.setItem(EVENTS_LOCAL_STORAGE_KEY, JSON.stringify([savedEvent]))

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({ name: 'new_event' })

  expect(
    JSON.parse(localStorage.getItem(EVENTS_LOCAL_STORAGE_KEY) as string),
  ).toEqual([])
})

it('works normally when localStorage is empty', () => {
  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({ name: 'new_event' })

  expect(MOAnalytics._queue).toHaveLength(1)
  expect(MOAnalytics._queue[0]).toMatchObject({ name: 'new_event' })
  expect(monitoring.sendMessage).not.toHaveBeenCalled()
})

it('works normally when localStorage contains invalid JSON', () => {
  localStorage.setItem(EVENTS_LOCAL_STORAGE_KEY, 'invalid-json')

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')
  MOAnalytics.captureEvent({ name: 'new_event' })

  expect(MOAnalytics._queue).toHaveLength(1)
  expect(MOAnalytics._queue[0]).toMatchObject({ name: 'new_event' })
})

it('sends recovered events in the next flush', async () => {
  const savedEvent = {
    id: 'saved-event-id',
    name: 'saved_event',
    userId: '1',
    occurredAt: '2023-12-31T00:00:00.000Z',
    properties: {},
  }
  localStorage.setItem(EVENTS_LOCAL_STORAGE_KEY, JSON.stringify([savedEvent]))

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: EVENTS_LIMIT,
  })
  MOAnalytics.setUserId('1')

  MOAnalytics.captureEvent({ name: 'new_event' })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  expect(global.fetch).toHaveBeenCalledWith(
    '/events/',
    expect.objectContaining({
      body: expect.stringContaining('saved_event'),
    }),
  )
  expect(global.fetch).toHaveBeenCalledWith(
    '/events/',
    expect.objectContaining({
      body: expect.stringContaining('new_event'),
    }),
  )
})
