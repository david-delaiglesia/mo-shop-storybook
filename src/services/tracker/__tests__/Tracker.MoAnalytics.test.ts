import Amplitude from 'amplitude-js'
import { vi } from 'vitest'

import { activeFeatureFlags } from '__tests__/helpers'
import { Cookie } from 'services/cookie'

vi.mock('services/mo-analytics', () => ({
  MOAnalytics: {
    captureEvent: vi.fn(),
  },
}))

const { Tracker } =
  await vi.importActual<typeof import('services/tracker')>('services/tracker')
const { MOAnalytics } = await import('services/mo-analytics/')

const AmplitudeClientSpy = {
  init: vi.fn(),
  setVersionName: vi.fn(),
  logEvent: vi.fn(),
}

beforeEach(() => {
  Cookie.areThirdPartyAccepted = vi.fn().mockReturnValue(true)
  vi.spyOn(Amplitude, 'getInstance').mockImplementation(
    () =>
      AmplitudeClientSpy as unknown as ReturnType<typeof Amplitude.getInstance>,
  )
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should call MOAnalytics.captureEvent when sendInteraction is called and feature flag is enabled', () => {
  activeFeatureFlags(['web-custom-event-implementation'])
  vi.spyOn(crypto, 'randomUUID').mockReturnValue(
    '00000000-0000-0000-0000-000000000001',
  )
  const eventName = 'home_view_click'
  const eventProperties = { title: 'some title' }

  Tracker.sendInteraction(eventName, eventProperties)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith({
    name: eventName,
    properties: {
      ...eventProperties,
      mo_event_id: '00000000-0000-0000-0000-000000000001',
    },
  })
})

it('should call MOAnalytics.captureEvent when sendViewChange is called and feature flag is enabled', () => {
  activeFeatureFlags(['web-custom-event-implementation'])
  const uuid = '00000000-0000-0000-0000-000000000001'
  vi.spyOn(crypto, 'randomUUID').mockReturnValue(uuid)
  const viewName = 'home'
  const eventProperties = { page: 'home' }

  Tracker.sendViewChange(viewName, eventProperties)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith({
    name: `${viewName}_view`,
    properties: {
      ...eventProperties,
      mo_event_id: uuid,
    },
  })
})

it('should not call MOAnalytics.captureEvent when sendInteraction is called and feature flag is disabled', () => {
  activeFeatureFlags([])
  const eventName = 'home_view_click'
  const eventProperties = { title: 'some title' }

  Tracker.sendInteraction(eventName, eventProperties)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})

it('should not call MOAnalytics.captureEvent when sendViewChange is called and feature flag is disabled', () => {
  activeFeatureFlags([])
  const viewName = 'home'
  const eventProperties = { page: 'home' }

  Tracker.sendViewChange(viewName, eventProperties)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})

it('should call MOAnalytics.captureEvent when sendInteractionGTAG is called and feature flag is enabled', () => {
  const eventName = 'product_impression'
  const eventProperties = { product_id: '123' }

  Tracker.sendInteractionGTAG(eventName, eventProperties)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith({
    name: eventName,
    properties: eventProperties,
  })
})
