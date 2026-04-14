import { screen } from '@testing-library/react'

import { confirmLogoutAlert, logout, openUserMenu } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Authenticate - Logout', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  delete global.window.location
  global.window.location = {
    reload: vi.fn(),
  }

  it('should logout and clear cache', async () => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openUserMenu('John')
    logout()
    confirmLogoutAlert()
    await screen.findByText('Sign in')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('logout_click')
    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })

  it('should display a confirmation alert after logout', async () => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openUserMenu('John')
    logout()
    const alert = await screen.findByRole('dialog')

    expect(alert).toHaveTextContent('Logout')
    expect(alert).toHaveTextContent('John, do you want to log out?')
    expect(alert).toContainElement(
      screen.getByRole('button', { name: 'Cancel' }),
    )
    expect(alert).toContainElement(
      screen.getByRole('button', { name: 'Logout' }),
    )
  })
})
