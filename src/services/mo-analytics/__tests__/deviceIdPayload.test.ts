import { MOAnalytics } from '..'
import { DeviceId } from '../device-id'

import { activeFeatureFlags } from '__tests__/helpers'

const FIVE_SECONDS = 5000
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
  localStorage.clear()
  DeviceId._reset()
  vitest.useFakeTimers()
  vitest.setSystemTime(new Date(EVENT_CREATED_AT))
  global.fetch = vitest.fn().mockResolvedValue({ ok: true })
})

afterEach(() => {
  resetEventsState()
  vitest.runOnlyPendingTimers()
  vitest.useRealTimers()
  vitest.clearAllMocks()
})

it('should include device_id in user_properties when feature flag is active', async () => {
  activeFeatureFlags([
    'web-custom-event-implementation',
    'web-mo-analytics-device-id',
  ])

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: 30,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({ name: 'some_event' })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
  const body = JSON.parse(options.body)

  expect(body.events[0].user_properties).toEqual({
    version: 'v0',
    platform: 'web',
    device_id: expect.stringMatching(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    ),
  })
})

it('should not include device_id in user_properties when feature flag is inactive', async () => {
  activeFeatureFlags(['web-custom-event-implementation'])

  MOAnalytics._init({
    apiUrl: '/events/',
    flushIntervalMs: FIVE_SECONDS,
    flushEventsNumberLimit: 30,
  })
  MOAnalytics.setUserId('user-123')

  MOAnalytics.captureEvent({ name: 'some_event' })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  const [, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
  const body = JSON.parse(options.body)

  expect(body.events[0].user_properties).toEqual({
    version: 'v0',
    platform: 'web',
  })
})
