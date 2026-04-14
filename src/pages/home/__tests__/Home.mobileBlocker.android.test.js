import { screen } from '@testing-library/react'

import { goToPlayStore } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { MobileDetector } from 'libs/mobile-detector'
import { resizeWindowToMobileSize } from 'pages/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Mobile Blocker - Android', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const mockUserAgent = (value) => {
    const userAgentGetter = vi.spyOn(window.navigator, 'userAgent', 'get')
    userAgentGetter.mockReturnValue(value)
  }

  const mockGetOSWithException = (
    message = 'getMobileOperatingSystem  mocked error',
  ) => {
    const spy = vi
      .spyOn(MobileDetector, 'getMobileOperatingSystem')
      .mockImplementation(() => {
        throw new Error(message)
      })

    return () => spy.mockRestore()
  }

  const showMobileBlocker = () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
  }

  it('should not display the mobile blocker when an error occurs', async () => {
    showMobileBlocker()
    mockGetOSWithException()
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Mercadona online shopping')
  })

  it('should go to play store link', async () => {
    showMobileBlocker()
    mockUserAgent('android')
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    const linkImage = await screen.findByAltText('Abrir App en Play Store')
    const openPlayStoreLink = linkImage.closest('a')
    goToPlayStore()

    expect(
      screen.queryByAltText('Abrir App en App Store'),
    ).not.toBeInTheDocument()
    expect(openPlayStoreLink).toHaveAttribute(
      'href',
      'https://play.google.com/store/apps/details?id=es.mercadona.tienda',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'download_app_button_click',
    )
  })

  it('should can see a page inside the whitelist', async () => {
    showMobileBlocker()
    mockUserAgent('android')
    wrap(App)
      .atPath('/password-recovery/ed3d5d4a-3564-4fe2-b42f-7fcf307b2533')
      .mount()

    await screen.findByRole('heading', { name: 'Reset password', level: 3 })

    expect(
      screen.queryByAltText('Abrir App en Play Store'),
    ).not.toBeInTheDocument()
  })

  it('should can see a page if the size is over the limit', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    mockUserAgent('android')
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    expect(
      screen.queryByAltText('Abrir App en Play Store'),
    ).not.toBeInTheDocument()
  })

  it('should display the mobile blocker if the page is resized', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    mockUserAgent('android')
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    resizeWindowToMobileSize()

    const linkImage = await screen.findByAltText('Abrir App en Play Store')

    expect(linkImage).toBeInTheDocument()
  })
})
