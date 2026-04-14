import { ANALYTICS_CUSTOM_PROPERTIES } from '../constants'
import Amplitude from 'amplitude-js'
import { vi } from 'vitest'

import { Cookie } from 'services/cookie'
import { Session } from 'services/session'
import { Storage } from 'services/storage'

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
  Cookie.areThirdPartyAccepted = vi.fn().mockReturnValue(true)
  vi.spyOn(Amplitude, 'getInstance').mockImplementation(() => {
    return AmplitudeClientSpy
  })
})

afterEach(() => {
  vi.clearAllMocks()
  Session.remove()
})

afterAll(() => {
  vi.clearAllMocks()
  Storage.clear()
  localStorage.clear()
})

const userId = '2963-1342-2347'
const eventName = 'home_view_click'
const eventProperties = {
  title: 'some title',
}
const userProperties = {
  warehouse: 'vlc1',
  postal_code: '46010',
  lang: 'en',
  identified: false,
}

it('should initialize all analytics clients', () => {
  Tracker.initialize()

  expect(window.gtag).toHaveBeenCalledWith(
    'config',
    import.meta.env.VITE_ANALYTICS_ID,
    {
      optimize_id: import.meta.env.VITE_OPTIMIZE_ID,
      custom_map: ANALYTICS_CUSTOM_PROPERTIES,
      cookie_domain: import.meta.env.VITE_ANALYTICS_DOMAIN,
    },
  )
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

it('should send interactions to clients', () => {
  vi.spyOn(crypto, 'randomUUID').mockReturnValue(
    '00000000-0000-0000-0000-000000000001',
  )

  Tracker.sendInteraction(eventName, eventProperties)

  expect(window.gtag).toHaveBeenCalledWith('event', 'home_view_click', {
    title: 'some title',
  })
  expect(AmplitudeClientSpy.logEvent).toHaveBeenCalledWith(eventName, {
    ...eventProperties,
    mo_event_id: '00000000-0000-0000-0000-000000000001',
  })
})

it('should send view change to clients', () => {
  const uuid = '00000000-0000-0000-0000-000000000001'
  vi.spyOn(crypto, 'randomUUID').mockReturnValue(uuid)
  const propertyViewName = `${eventName}_view`

  Tracker.sendViewChange(eventName, eventProperties)

  expect(window.gtag).toHaveBeenCalledWith('event', propertyViewName)
  expect(window.gtag).toHaveBeenCalledWith(
    'config',
    import.meta.env.VITE_ANALYTICS_ID,
    {
      optimize_id: import.meta.env.VITE_OPTIMIZE_ID,
      custom_map: ANALYTICS_CUSTOM_PROPERTIES,
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname,
      cookie_domain: import.meta.env.VITE_ANALYTICS_DOMAIN,
    },
  )
  expect(AmplitudeClientSpy.logEvent).toHaveBeenCalledWith(propertyViewName, {
    ...eventProperties,
    mo_event_id: uuid,
  })
})

it('should set super-properties to clients', () => {
  Tracker.setSuperProperties()

  expect(window.gtag).toHaveBeenCalledWith(
    'set',
    'dimension5',
    userProperties.warehouse,
  )
  expect(window.gtag).toHaveBeenCalledWith(
    'set',
    'dimension6',
    userProperties.postal_code,
  )
  expect(window.gtag).toHaveBeenCalledWith(
    'set',
    'dimension7',
    userProperties.identified,
  )
  expect(window.gtag).toHaveBeenCalledWith(
    'set',
    'dimension8',
    import.meta.env.VITE_APP_VERSION,
  )
  expect(window.gtag).toHaveBeenCalledWith(
    'set',
    'dimension9',
    userProperties.lang,
  )
})

it('should set user properties to clients', () => {
  Tracker.setUserProperties(userProperties)

  expect(AmplitudeClientSpy.setUserProperties).toHaveBeenCalledWith(
    userProperties,
  )
})

it('should identifer existing user to clients', () => {
  Tracker.identifyExistingUser(userId)

  expect(window.gtag).toHaveBeenCalledWith('set', 'dimension20', userId)
  expect(AmplitudeClientSpy.setUserId).toHaveBeenCalledWith(userId)
})

it('should register new users to clients', () => {
  Tracker.registerNewUser(userId)

  expect(window.gtag).toHaveBeenCalledWith('set', 'dimension20', userId)
  expect(AmplitudeClientSpy.setUserId).toHaveBeenCalledWith(userId)
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
