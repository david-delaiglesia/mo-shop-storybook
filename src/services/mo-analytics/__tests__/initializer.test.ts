import { IVariant } from '@unleash/proxy-client-react'

import { initializeEventsWithUnleash } from '../initializer'
import { MOAnalytics } from '../mo-analytics'

import { unleashClient } from 'services/feature-flags/FeatureFlagsProvider'

vi.mock('../mo-analytics', () => ({
  MOAnalytics: {
    _init: vi.fn(),
  },
}))

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.restoreAllMocks()
})

const mockReadyUnleashClient = () => {
  vi.spyOn(unleashClient, 'on').mockImplementation((event, callback) => {
    if (event === 'ready' && typeof callback === 'function') {
      callback()
    }
    return unleashClient
  })
}

const mockUnleashVariants = () => {
  vi.spyOn(unleashClient, 'getVariant').mockImplementation((variantName) => {
    const variants: Record<string, IVariant> = {
      moanalytics_batch_size: {
        name: 'moanalytics_batch_size',
        payload: { type: 'string', value: '50' },
        enabled: true,
      },
      moanalytics_send_interval_seconds: {
        name: 'moanalytics_send_interval_seconds',
        payload: { type: 'string', value: '10' },
        enabled: true,
      },
      moanalytics_max_queue_size: {
        name: 'moanalytics_max_queue_size',
        payload: { type: 'string', value: '500' },
        enabled: true,
      },
    }
    return variants[variantName]
  })
}

it('should initialize events with unleash variants when all variants are provided', async () => {
  mockReadyUnleashClient()
  mockUnleashVariants()

  await initializeEventsWithUnleash('https://api.example.com/events')

  expect(MOAnalytics._init).toHaveBeenCalledWith({
    apiUrl: 'https://api.example.com/events',
    flushIntervalMs: 10000,
    flushEventsNumberLimit: 50,
    eventsBufferMaxSize: 500,
  })
})

it('should initialize events with default values when unleash variants are not provided', async () => {
  mockReadyUnleashClient()

  // unleash getVariant returns undefined
  vi.spyOn(unleashClient, 'getVariant').mockReturnValue({
    name: 'dummy',
    payload: undefined,
    enabled: false,
  })

  await initializeEventsWithUnleash('https://api.example.com/events')

  expect(MOAnalytics._init).toHaveBeenCalledWith({
    apiUrl: 'https://api.example.com/events',
    flushIntervalMs: 30000,
    flushEventsNumberLimit: 30,
    eventsBufferMaxSize: 3000,
  })
})

it('should initialize events with default values when unleash fails', async () => {
  vi.spyOn(console, 'error').mockImplementation(() => {})
  // unleash client fails
  vi.spyOn(unleashClient, 'on').mockImplementation((event, callback) => {
    if (event === 'error' && typeof callback === 'function') {
      callback(new Error('Unleash failed'))
    }
    return unleashClient
  })

  await initializeEventsWithUnleash('https://api.example.com/events')

  expect(MOAnalytics._init).toHaveBeenCalledWith({
    apiUrl: 'https://api.example.com/events',
    flushIntervalMs: 30000,
    flushEventsNumberLimit: 30,
    eventsBufferMaxSize: 3000,
  })
})
