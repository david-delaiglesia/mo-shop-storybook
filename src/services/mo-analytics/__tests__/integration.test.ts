import { IVariant } from '@unleash/proxy-client-react'

import { MOAnalytics } from '..'

import { activeFeatureFlags } from '__tests__/helpers'
import { unleashClient } from 'services/feature-flags/FeatureFlagsProvider'

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

const mockUnleashReady = () => {
  vi.spyOn(unleashClient, 'on').mockImplementation((event, callback) => {
    if (event === 'ready' && typeof callback === 'function') {
      callback()
    }
    return unleashClient
  })
}

const mockUnleashGetVariant = () => {
  vi.spyOn(unleashClient, 'getVariant').mockImplementation((variantName) => {
    const variants: Record<string, IVariant> = {
      moanalytics_batch_size: {
        name: 'moanalytics_batch_size',
        payload: { type: 'string', value: '30' },
        enabled: true,
      },
      moanalytics_send_interval_seconds: {
        name: 'moanalytics_send_interval_seconds',
        payload: { type: 'string', value: '5' },
        enabled: true,
      },
      moanalytics_max_queue_size: {
        name: 'moanalytics_max_queue_size',
        payload: { type: 'string', value: '300' },
        enabled: true,
      },
    }
    return variants[variantName]
  })
}

const mockFFEnabled = () => {
  activeFeatureFlags(['web-custom-event-implementation'])
}

beforeEach(() => {
  resetEventsState()
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

it('should send event through full initialization flow', async () => {
  mockUnleashReady()
  mockUnleashGetVariant()
  mockFFEnabled()

  MOAnalytics.init('/events/')
  MOAnalytics.setUserId('user-123')
  // wait until the events library is ready
  await vitest.waitFor(() => {
    expect(MOAnalytics._url).toBe('/events/')
  })

  MOAnalytics.captureEvent({
    name: 'add_product_click',
  })

  await vitest.advanceTimersByTimeAsync(FIVE_SECONDS)

  const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock
    .calls[0]
  expect({
    url,
    method: options.method,
    headers: options.headers,
    body: JSON.parse(options.body),
  }).toEqual({
    url: '/events/',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      events: [
        {
          id: '10000000-1000-4000-8000-100000000000',
          user_id: 'user-123',
          occurred_at: expect.stringMatching(/^2024-01-01T00:00:00\.\d{3}Z$/),
          name: 'add_product_click',
          properties: {},
          user_properties: {
            version: 'v0',
            platform: 'web',
          },
        },
      ],
    },
  })
})
