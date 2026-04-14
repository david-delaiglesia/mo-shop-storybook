import Amplitude from 'amplitude-js'
import { vi } from 'vitest'

import { Cookie } from 'services/cookie'
import { Session } from 'services/session'

const { Tracker } = await vi.importActual('services/tracker')

const AmplitudeClientSpy = {
  init: vi.fn(),
  setVersionName: vi.fn(),
  logEvent: vi.fn(),
  setUserProperties: vi.fn(),
  setUserId: vi.fn(),
  regenerateDeviceId: vi.fn(),
}

beforeEach(() => {
  Cookie.areThirdPartyAccepted = vi.fn().mockReturnValue(false)
  vi.spyOn(Amplitude, 'getInstance').mockImplementation(() => {
    return AmplitudeClientSpy
  })
})

it('should not initialize third party analytics clients', () => {
  Tracker.initialize()

  expect(window.gtag).not.toHaveBeenCalled()
  expect(AmplitudeClientSpy.init).toHaveBeenCalledWith(
    import.meta.env.VITE_AMPLITUDE_TOKEN,
    null,
    {
      domain: import.meta.env.VITE_ANALYTICS_DOMAIN,
      cookieExpiration: 365,
      includeUtm: true,
      includeReferrer: true,
      savedMaxCount: 100,
    },
  )
  expect(AmplitudeClientSpy.setVersionName).toHaveBeenCalledWith(
    import.meta.env.VITE_APP_VERSION,
  )
})

it('should not send interactions to third party clients', () => {
  Tracker.sendInteraction('foo', {})

  expect(window.gtag).not.toHaveBeenCalled()
  expect(AmplitudeClientSpy.logEvent).toHaveBeenCalled()
})

it('should not set user super-properties to third party clients', () => {
  Tracker.setSuperProperties()

  expect(window.gtag).not.toHaveBeenCalled()
})

it('should not set user properties to third party clients', () => {
  Tracker.setUserProperties('properties')

  expect(AmplitudeClientSpy.setUserProperties).toHaveBeenCalled()
})

it('should not identifer existing user to third party clients', () => {
  Tracker.identifyExistingUser('userId')

  expect(window.gtag).not.toHaveBeenCalled()
  expect(AmplitudeClientSpy.setUserId).toHaveBeenCalled()
})

it('should not register new users to third party clients', () => {
  Tracker.registerNewUser('userId')

  expect(window.gtag).not.toHaveBeenCalled()
  expect(AmplitudeClientSpy.setUserId).toHaveBeenCalled()
})

it('should remove user id to clients when logout', async () => {
  Session.get = vi.fn().mockReturnValue({
    lang: 'es',
    warehouse: 'vlc1',
    postalCode: '46017',
    isAuth: false,
  })

  Tracker.logout()

  expect(AmplitudeClientSpy.setUserId).toHaveBeenCalledWith(null)
  expect(AmplitudeClientSpy.setUserProperties).toHaveBeenCalledWith({
    lang: 'en',
    warehouse: 'vlc1',
    postal_code: '46017',
  })
})
