import { screen } from '@testing-library/react'

import { goToAppStore } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { resizeWindowToMobileSize } from 'pages/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Mobile Blocker - IOS', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const mockUserAgent = (value) => {
    const userAgentGetter = vi.spyOn(window.navigator, 'userAgent', 'get')
    userAgentGetter.mockReturnValue(value)
  }

  const showMobileBlocker = () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false })
  }

  it('should go to app store link', async () => {
    showMobileBlocker()
    mockUserAgent('iPhone')
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    const linkImage = await screen.findByAltText('Abrir App en App Store')
    const openAppStoreLink = linkImage.closest('a')
    goToAppStore()

    expect(
      screen.queryByAltText('Abrir App en Play Store'),
    ).not.toBeInTheDocument()
    expect(openAppStoreLink).toHaveAttribute(
      'href',
      'https://itunes.apple.com/app/apple-store/id1368037685',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'download_app_button_click',
    )
  })

  it('should can see a page inside the whitelist', async () => {
    showMobileBlocker()
    mockUserAgent('iPhone')
    wrap(App)
      .atPath('/password-recovery/ed3d5d4a-3564-4fe2-b42f-7fcf307b2533')
      .mount()

    await screen.findByRole('heading', { name: 'Reset password', level: 3 })

    expect(
      screen.queryByAltText('Abrir App en App Store'),
    ).not.toBeInTheDocument()
  })

  it('should can see a page if the size is over the limit', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    mockUserAgent('iPhone')
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    expect(
      screen.queryByAltText('Abrir App en App Store'),
    ).not.toBeInTheDocument()
  })

  it('should display the mobile blocker if the page is resized', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })
    mockUserAgent('iPhone')
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    resizeWindowToMobileSize()

    const linkImage = await screen.findByAltText('Abrir App en App Store')

    expect(linkImage).toBeInTheDocument()
  })
})
