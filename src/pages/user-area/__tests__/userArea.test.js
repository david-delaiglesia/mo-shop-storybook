import { screen, within } from '@testing-library/react'

import { cancelLogout, confirmLogout, doLogout } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User area', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  delete global.window.location
  global.window.location = {
    assign: vi.fn(),
    reload: vi.fn(),
  }

  afterEach(() => {
    Tracker.sendInteraction.mockClear()
  })

  it('should display the user area menu', async () => {
    wrap(App).atPath('/user-area/personal-info').withLogin().mount()

    const [userAreaMenu] = await screen.findAllByRole('complementary')

    expect(userAreaMenu).toHaveTextContent('My orders')
    expect(userAreaMenu).toHaveTextContent('Personal data')
    expect(userAreaMenu).toHaveTextContent('Addresses')
    expect(userAreaMenu).toHaveTextContent('Payment methods')
    expect(userAreaMenu).toHaveTextContent('FAQ')
    expect(userAreaMenu).toHaveTextContent('Logout')
    expect(userAreaMenu).toHaveTextContent('Logout')
    expect(userAreaMenu).toHaveTextContent('v0')
  })

  it('should display the hidden span when the FF is active', async () => {
    wrap(App).atPath('/user-area/personal-info').withLogin().mount()

    await screen.findAllByRole('complementary')

    expect(
      screen.queryByTestId('user-area-menu--unleash-test'),
    ).not.toBeInTheDocument()
  })

  it('should display the logout alert', async () => {
    wrap(App).atPath('/user-area/personal-info').withLogin().mount()

    await screen.findByText('Logout')
    doLogout()

    const alert = screen.getByRole('dialog', {
      name: 'Logout. John, do you want to log out?',
    })
    expect(
      within(alert).getByText('John, do you want to log out?'),
    ).toBeInTheDocument()
    expect(
      within(alert).getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument()
    expect(
      within(alert).getByRole('button', { name: 'Logout' }),
    ).toBeInTheDocument()
  })

  it('should close the logout alert', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App)
      .atPath('/user-area/personal-info')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Logout')
    doLogout()
    const alert = screen.getByRole('dialog', {
      name: 'Logout. John, do you want to log out?',
    })
    cancelLogout()

    expect(alert).not.toBeInTheDocument()
  })

  it('should allow to logout', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App)
      .atPath('/user-area/personal-info')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Logout')
    doLogout()
    confirmLogout()
    await screen.findByText('Novedades')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('logout_click')
  })
})
