import { screen, waitForElementToBeRemoved } from '@testing-library/react'

import {
  acceptCookies,
  acceptOnboardingModal,
  rejectCookies,
  setPostalCode,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Cookie', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const mount = ({ responses = [] } = {}) =>
    wrap(App).atPath('/').withNetwork(responses).mount()

  beforeEach(() => {
    Cookie.get = vi.fn()
    Cookie.areThirdPartyAccepted = vi.fn()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should see the cookie banner', async () => {
    import.meta.env.VITE_COOKIES_VERSION = 0
    const responses = { path: '/home/', responseBody: homeWithGrid }
    mount({ responses })

    const message = await screen.findByText(
      /We use first-party and third-party cookies/,
    )
    const image = screen.getByAltText('cookie')
    const moreInfo = screen.getAllByText('Further information')[0]
    expect(image).toBeInTheDocument()
    expect(message).toBeInTheDocument()
    expect(moreInfo).toBeInTheDocument()
    expect(window.gtag).toHaveBeenCalledWith('consent', 'default', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
      analytics_storage: 'denied',
      wait_for_update: 500,
    })
  })

  it('should accept the cookies', async () => {
    import.meta.env.VITE_COOKIES_VERSION = 1
    Cookie.save = vi.fn()
    const responses = { path: '/home/', responseBody: homeWithGrid }
    mount({ responses })

    await screen.findByAltText('cookie')
    acceptCookies()

    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).not.toBeInTheDocument()
    expect(Cookie.save).toHaveBeenCalledWith(
      { thirdParty: true, necessary: true, version: 1 },
      import.meta.env.VITE_ACCEPTED_COOKIES,
      'mercadona.es',
      { secure: true, samesite: 'none' },
    )
  })

  it('should reject the cookies', async () => {
    import.meta.env.VITE_COOKIES_VERSION = 1
    Cookie.save = vi.fn()
    const responses = { path: '/home/', responseBody: homeWithGrid }
    mount({ responses })

    await screen.findByAltText('cookie')
    rejectCookies()

    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).not.toBeInTheDocument()
    expect(Cookie.save).toHaveBeenCalledWith(
      { thirdParty: false, necessary: true, version: 1 },
      import.meta.env.VITE_ACCEPTED_COOKIES,
      'mercadona.es',
      { secure: true, samesite: 'none' },
    )
  })

  it('should accept the cookies when there is no version defined', async () => {
    import.meta.env.VITE_COOKIES_VERSION = 0
    Cookie.save = vi.fn()
    const responses = { path: '/home/', responseBody: homeWithGrid }
    mount({ responses })

    await screen.findByAltText('cookie')
    acceptCookies()

    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).not.toBeInTheDocument()
    expect(Cookie.save).toHaveBeenCalledWith(
      { thirdParty: true, necessary: true, version: 0 },
      import.meta.env.VITE_ACCEPTED_COOKIES,
      'mercadona.es',
      { secure: true, samesite: 'none' },
    )
  })

  it('should reject the cookies when there is no version defined', async () => {
    import.meta.env.VITE_COOKIES_VERSION = 0
    Cookie.save = vi.fn()
    const responses = { path: '/home/', responseBody: homeWithGrid }
    mount({ responses })

    await screen.findByAltText('cookie')
    rejectCookies()

    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).not.toBeInTheDocument()
    expect(Cookie.save).toHaveBeenCalledWith(
      { thirdParty: false, necessary: true, version: 0 },
      import.meta.env.VITE_ACCEPTED_COOKIES,
      'mercadona.es',
      { secure: true, samesite: 'none' },
    )
  })

  it('should not see the cookies banner if it is accepted', async () => {
    import.meta.env.VITE_COOKIES_VERSION = 0
    Cookie.get.mockReturnValue({ thirdParty: true, necessary: true })
    Cookie.areThirdPartyAccepted = vi.fn().mockReturnValue(true)
    const responses = { path: '/home/', responseBody: homeWithGrid }
    mount({ responses })

    await screen.findByText('Novedades')

    expect(Tracker.sendViewChange).toHaveBeenCalledWith('home', {
      device_pixel_ratio_web: 2,
      screen_outher_width_web: 1200,
      screen_inner_width_web: 1200,
      screen_inner_outher_width_ratio_web: 1,
      screen_height_web: 800,
      screen_width_web: 1200,
    })
    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).not.toBeInTheDocument()
  })

  it('should not see the cookies banner if it is accepted the current version', async () => {
    import.meta.env.VITE_COOKIES_VERSION = 1
    Cookie.get.mockReturnValue({
      thirdParty: true,
      necessary: true,
      version: 1,
    })
    Cookie.areThirdPartyAccepted = vi.fn().mockReturnValue(true)
    const responses = { path: '/home/', responseBody: homeWithGrid }
    mount({ responses })

    await screen.findByText('Novedades')

    expect(Tracker.sendViewChange).toHaveBeenCalledWith('home', {
      device_pixel_ratio_web: 2,
      screen_outher_width_web: 1200,
      screen_inner_width_web: 1200,
      screen_inner_outher_width_ratio_web: 1,
      screen_height_web: 800,
      screen_width_web: 1200,
    })
    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).not.toBeInTheDocument()
  })

  it('should set the cookies when the user accept it', async () => {
    import.meta.env.VITE_COOKIES_VERSION = 0
    const responses = { path: '/home/', responseBody: homeWithGrid }
    mount({ responses })

    await screen.findByAltText('cookie')

    expect(Tracker.initialize).toHaveBeenCalled()
    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).toBeInTheDocument()

    Cookie.get.mockReturnValue({ thirdParty: true, necessary: true })
    acceptCookies()

    expect(Tracker.initialize).toHaveBeenCalled()

    expect(window.gtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      analytics_storage: 'granted',
    })
    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).not.toBeInTheDocument()
  })

  it('should not set the cookies when the user introduce the postal code', async () => {
    import.meta.env.VITE_COOKIES_VERSION = 0
    const postalCode = '46004'
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/postal-codes/actions/change-pc/',
        requestBody: { new_postal_code: postalCode },
        method: 'put',
      },
    ]
    mount({ responses })

    await screen.findByRole('dialog')

    const cookieImage = screen.getByAltText('cookie')
    const postalCodeModalTitle = screen.getByText(
      'Enter your postal code in order to access your shop',
    )
    expect(cookieImage).toBeInTheDocument()
    expect(postalCodeModalTitle).toBeInTheDocument()

    setPostalCode(postalCode)
    acceptOnboardingModal()

    await waitForElementToBeRemoved(() =>
      screen.getByText('Enter your postal code in order to access your shop'),
    )

    expect(Tracker.initialize).toHaveBeenCalled()
    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).toBeInTheDocument()
  })

  it('should see the cookies banner even if the postal code is introduced', async () => {
    import.meta.env.VITE_COOKIES_VERSION = 0
    const COOKIES = {
      [import.meta.env.VITE_DELIVERY_COOKIE]: { postalCode: '46010' },
    }
    Cookie.save = vi.fn((cookie, cookieName) => {
      COOKIES[cookieName] = cookie
    })
    Cookie.get = vi.fn((cookieName) => {
      return COOKIES[cookieName]
    })

    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    mount({ responses })

    await screen.findByText('Novedades')

    expect(Tracker.initialize).toHaveBeenCalled()
    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).toBeInTheDocument()
  })

  it('should display the cookie banner if has an outdated version of cookies', async () => {
    import.meta.env.VITE_COOKIES_VERSION = 2
    Cookie.get.mockReturnValue({
      thirdParty: true,
      necessary: true,
      version: 1,
    })
    Cookie.remove = vi.fn()
    const responses = { path: '/home/', responseBody: homeWithGrid }
    mount({ responses })

    await screen.findByText('Novedades')

    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).toBeInTheDocument()
    expect(Cookie.remove).toHaveBeenCalledWith(
      import.meta.env.VITE_ACCEPTED_COOKIES,
      'mercadona.es',
    )
  })
})
