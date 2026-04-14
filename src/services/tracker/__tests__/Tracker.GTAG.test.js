import Amplitude from 'amplitude-js'
import { vi } from 'vitest'

import { Cookie } from 'services/cookie'

const { Tracker } = await vi.importActual('services/tracker')

let mockGtag

const AmplitudeClientSpy = {
  init: vi.fn(),
  setVersionName: vi.fn(),
  logEvent: vi.fn(),
  setUserProperties: vi.fn(),
  setUserId: vi.fn(),
  regenerateDeviceId: vi.fn(),
}

beforeEach(() => {
  mockGtag = vi.fn()
  Object.defineProperty(window, 'gtag', {
    value: mockGtag,
    writable: true,
    configurable: true,
  })
  Cookie.areThirdPartyAccepted = vi.fn().mockReturnValue(true)
  vi.spyOn(Amplitude, 'getInstance').mockImplementation(() => {
    return AmplitudeClientSpy
  })
})

afterEach(() => {
  vi.clearAllMocks()
  delete window.gtag
})

it('should call gtag with correct parameters when sendInteractionGTAG is called', () => {
  const eventName = 'test_event'
  const options = {
    product_id: '19920',
    display_name: 'Jamón cebo ibérico 50% La Hacienda del Ibérico lonchas',
    source: 'new_arrivals',
    layout: 1,
  }

  Tracker.sendInteractionGTAG(eventName, options)

  expect(mockGtag).toHaveBeenCalledWith('event', eventName, options)
})

it('should call gtag with correct parameters when sendInteraction is called', () => {
  const eventName = 'test_event'
  const options = {
    product_id: '19920',
    display_name: 'Jamón cebo ibérico 50% La Hacienda del Ibérico lonchas',
    source: 'new_arrivals',
    layout: 1,
  }

  Tracker.sendInteraction(eventName, options)

  expect(mockGtag).toHaveBeenCalledWith('event', eventName, options)
})
