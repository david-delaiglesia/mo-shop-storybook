import { screen } from '@testing-library/react'

import { openCookieConfiguration } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  acceptSelectedCookies,
  acceptThirdPartyCookies,
  closeCookieConfigurator,
  openAnalyticRequiredCookies,
  openTechnicalCookies,
  openThirdPartyCookies,
} from 'pages/helpers'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

const { VITE_ACCEPTED_COOKIES, VITE_COOKIE_DOMAIN } = import.meta.env

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Cookie', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    Cookie.get = vi
      .fn()
      .mockReturnValue({ language: 'en', postalCode: '46010' })
    Cookie.areThirdPartyAccepted = vi.fn()
    Cookie.save = vi.fn()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should see the cookie configurator', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork({ path: '/home/', responseBody: homeWithGrid })
      .mount()

    await screen.findByText(/We use first-party and third-party cookies/)

    openCookieConfiguration()

    const configurator = screen.getByLabelText('Cookie settings')
    expect(configurator).toBeInTheDocument()
  })

  it('should see the basic info in the cookie configurator', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork({ path: '/home/', responseBody: homeWithGrid })
      .mount()

    await screen.findByText(/We use first-party and third-party cookies/)

    openCookieConfiguration()

    const configurator = screen.getByLabelText('Cookie settings')
    expect(configurator).toHaveTextContent(
      'This website uses cookies to make the web page',
    )
    expect(configurator).toHaveTextContent(
      'We also use third-party statistical cookies',
    )
    expect(configurator).toHaveTextContent('Technical cookies')
    expect(configurator).toHaveTextContent('Analytics')
    expect(configurator).toHaveTextContent('Accept')
    expect(configurator).toHaveTextContent('Close')
  })

  it('should open technical cookies section on clicking into it', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork({ path: '/home/', responseBody: homeWithGrid })
      .mount()
    await screen.findByText(/We use first-party and third-party cookies/)
    openCookieConfiguration()
    const configurator = screen.getByLabelText('Cookie settings')

    openTechnicalCookies()

    expect(configurator).toHaveTextContent(
      'These are necessary for the web page to function and, therefore, cannot be disabled.',
    )
  })

  it('should show required analytics cookies section', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork({ path: '/home/', responseBody: homeWithGrid })
      .mount()
    await screen.findByText(/We use first-party and third-party cookies/)
    openCookieConfiguration()
    const configurator = screen.getByLabelText('Cookie settings')

    openAnalyticRequiredCookies()

    expect(configurator).toHaveTextContent(
      'They are required to perform statistical analysis on anonymised data regarding the way users browse our website.',
    )
    expect(configurator).toHaveTextContent(
      'This cookie allows us to collect anonymised data about the way users browse our website so that we can carry out statistical analysis on its use.',
    )
  })

  it('should open analytical cookies section on clicking into it', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork({ path: '/home/', responseBody: homeWithGrid })
      .mount()
    await screen.findByText(/We use first-party and third-party cookies/)
    openCookieConfiguration()
    const configurator = screen.getByLabelText('Cookie settings')

    openThirdPartyCookies()

    expect(configurator).toHaveTextContent(
      'These make it possible to analyse your browsing on our website for statistical studies on usage.',
    )
  })

  it('should not been checked third party cookies', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork({ path: '/home/', responseBody: homeWithGrid })
      .mount()
    await screen.findByText(/We use first-party and third-party cookies/)
    openCookieConfiguration()

    expect(screen.getByLabelText('Accept analytical cookies')).not.toBeChecked()
  })

  it('should check third party cookies on clicking on checkbox', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork({ path: '/home/', responseBody: homeWithGrid })
      .mount()
    await screen.findByText(/We use first-party and third-party cookies/)
    openCookieConfiguration()
    const checkbox = screen.getByLabelText('Accept analytical cookies')

    acceptThirdPartyCookies()

    expect(checkbox).toBeChecked()
  })
  it('should see the necessary cookies when open the necessary cookies list', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork({ path: '/home/', responseBody: homeWithGrid })
      .mount()
    await screen.findByText(/We use first-party and third-party cookies/)
    openCookieConfiguration()

    openTechnicalCookies()

    const cookies = [
      '__mo_da',
      '__mo_ca',
      '__mo_ui',
      '__zlcmid',
      'amplitude_id',
    ]

    cookies.forEach((cookie) => {
      const cookieItem = screen.getByText(cookie).closest('li')

      expect(cookieItem).toHaveTextContent(cookie)
      expect(cookieItem).toHaveTextContent('Expiration')
      expect(cookieItem).toHaveTextContent('Description')
    })
  })

  it('should accept all cookies in the configuration', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork({ path: '/home/', responseBody: homeWithGrid })
      .mount()
    await screen.findByText(/We use first-party and third-party cookies/)
    openCookieConfiguration()
    acceptThirdPartyCookies()

    const modal = screen.queryByRole('dialog')
    acceptSelectedCookies(modal)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).not.toBeInTheDocument()
    expect(Tracker.initialize).toHaveBeenCalled()
    expect(Cookie.save).toHaveBeenCalledWith(
      { thirdParty: true, necessary: true, version: 1 },
      VITE_ACCEPTED_COOKIES,
      VITE_COOKIE_DOMAIN,
      { samesite: 'none', secure: true },
    )
  })

  it('should accept only technical cookies in the configuration', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork({ path: '/home/', responseBody: homeWithGrid })
      .mount()
    await screen.findByText(/We use first-party and third-party cookies/)
    openCookieConfiguration()

    const modal = screen.queryByRole('dialog')
    acceptSelectedCookies(modal)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.queryByText(/We use first-party and third-party cookies/),
    ).not.toBeInTheDocument()
    expect(Tracker.initialize).toHaveBeenCalled()
    expect(Cookie.save).toHaveBeenCalledWith(
      { thirdParty: false, necessary: true, version: 1 },
      VITE_ACCEPTED_COOKIES,
      VITE_COOKIE_DOMAIN,
      { samesite: 'none', secure: true },
    )
  })

  it('should close the cookie configurator', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork({ path: '/home/', responseBody: homeWithGrid })
      .mount()

    await screen.findByText(/We use first-party and third-party cookies/)

    openCookieConfiguration()
    closeCookieConfigurator()

    expect(screen.queryByLabelText('Cookie settings')).not.toBeInTheDocument()
  })
})
