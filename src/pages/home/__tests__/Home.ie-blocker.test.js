import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { downloadBrowser } from 'pages/helpers'
import { Cookie } from 'services/cookie'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - IE Blocker', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  let windowNavigatorBackup

  beforeEach(() => {
    windowNavigatorBackup = window.navigator
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  })

  afterEach(() => {
    window.navigator = windowNavigatorBackup
    vi.clearAllMocks()
  })

  it('should display the IE blocker for IE 11', async () => {
    window.MSInputMethodContext = vi.fn()
    document.documentMode = vi.fn()
    const responses = [
      { path: `/customers/1/home/`, responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const IEBlocker = screen.getByLabelText('Unsupported browser')
    expect(IEBlocker).toBeInTheDocument()
    expect(IEBlocker).toHaveTextContent('Unsupported browser')
    expect(IEBlocker).toHaveTextContent('We are sorry, but we cannot guarantee')
    expect(IEBlocker).toHaveTextContent('Microsoft Edge')
    expect(IEBlocker).toHaveTextContent('Google Chrome')
    expect(IEBlocker).toHaveTextContent('Mozilla Firefox')
    expect(IEBlocker).toHaveTextContent('Safari')
    expect(IEBlocker).toHaveTextContent('Remember that if you have any doubts')
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('old_browser_popup')
  })

  it('should display the IE blocker for EI < 11', async () => {
    Object.defineProperty(window.navigator, 'appName', {
      value: 'Microsoft Internet Explorer',
      writable: true,
    })
    const responses = [
      { path: `/customers/1/home/`, responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const IEBlocker = screen.getByLabelText('Unsupported browser')
    expect(IEBlocker).toBeInTheDocument()
    expect(IEBlocker).toHaveTextContent('Unsupported browser')
    expect(IEBlocker).toHaveTextContent('We are sorry, but we cannot guarantee')
    expect(IEBlocker).toHaveTextContent('Microsoft Edge')
    expect(IEBlocker).toHaveTextContent('Google Chrome')
    expect(IEBlocker).toHaveTextContent('Mozilla Firefox')
    expect(IEBlocker).toHaveTextContent('Safari')
    expect(IEBlocker).toHaveTextContent('Remember that if you have any doubts')
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('old_browser_popup')
  })

  it('should display links for each browser', async () => {
    window.MSInputMethodContext = vi.fn()
    document.documentMode = vi.fn()
    const responses = [
      { path: `/customers/1/home/`, responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByLabelText('Unsupported browser')

    expect(screen.getByText('Microsoft Edge').closest('a')).toHaveAttribute(
      'href',
      'https://www.microsoft.com/edge',
    )
    expect(screen.getByText('Microsoft Edge').closest('a')).toHaveAttribute(
      'target',
      '_blank',
    )
    expect(screen.getByText('Google Chrome').closest('a')).toHaveAttribute(
      'href',
      'https://www.google.com/chrome/',
    )
    expect(screen.getByText('Google Chrome').closest('a')).toHaveAttribute(
      'target',
      '_blank',
    )
    expect(screen.getByText('Mozilla Firefox').closest('a')).toHaveAttribute(
      'href',
      'https://www.mozilla.org/firefox/new/',
    )
    expect(screen.getByText('Mozilla Firefox').closest('a')).toHaveAttribute(
      'target',
      '_blank',
    )
    expect(screen.getByText('Safari').closest('a')).toHaveAttribute(
      'href',
      'https://support.apple.com/downloads/safari',
    )
    expect(screen.getByText('Safari').closest('a')).toHaveAttribute(
      'target',
      '_blank',
    )
  })

  it('should display the support chat', async () => {
    window.MSInputMethodContext = vi.fn()
    document.documentMode = vi.fn()
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App)
      .atPath('/categories/112')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByLabelText('Unsupported browser')

    expect(Support.showButton).toHaveBeenCalled()
  })

  it('should allow to click in the browsers link', async () => {
    window.MSInputMethodContext = vi.fn()
    document.documentMode = vi.fn()
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App)
      .atPath('/categories/112')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByLabelText('Unsupported browser')

    downloadBrowser('Microsoft Edge')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'old_browser_popup_choice_click',
      { option: 'edge' },
    )
  })

  it('should not display the support chat if the browser is not IE', async () => {
    window.MSInputMethodContext = undefined
    document.documentMode = undefined
    Object.defineProperty(window.navigator, 'appName', {
      value: 'Netscape',
      writable: true,
    })
    const responses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App)
      .atPath('/categories/112')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Categories')

    expect(Support.showButton).not.toHaveBeenCalled()
  })

  it('should not display the IE blocker if the browser is not IE', async () => {
    window.MSInputMethodContext = undefined
    document.documentMode = undefined
    Object.defineProperty(window.navigator, 'appName', {
      value: 'Netscape',
      writable: true,
    })
    const responses = [
      { path: `/customers/1/home/`, responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const IEBlocker = screen.queryByLabelText('Unsupported browser')
    expect(IEBlocker).not.toBeInTheDocument()
  })
})
