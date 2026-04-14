import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { cookiesWithoutDeliveryInfo } from 'app/cookie/__scenarios__/cookies'
import { openAccountDropdown, openSignInModal } from 'pages/helpers'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Account menu - Login flow', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should open login modal from login button', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    openAccountDropdown()
    openSignInModal()
    const loginModal = await screen.findByRole('dialog')

    expect(loginModal).toHaveTextContent('Enter your email')
    expect(window.location.search).toBe('?authenticate-user=')
  })

  it('should not open modal if user does not have postal code', async () => {
    Cookie.get = vi.fn((cookie) => cookiesWithoutDeliveryInfo[cookie])
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument()
  })

  it('should not open modal if user is already logged', async () => {
    const responses = [
      { path: `/customers/1/home/`, responseBody: homeWithGrid },
    ]
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Novedades')

    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument()
  })
})
