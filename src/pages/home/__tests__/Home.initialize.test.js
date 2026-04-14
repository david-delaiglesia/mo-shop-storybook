import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithBanner } from 'app/catalog/__scenarios__/home'
import { openUserDropdown } from 'pages/home/__tests__/helpers'
import { Cookie } from 'services/cookie'
import { Session } from 'services/session'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Initialize', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  Cookie.get = vi.fn()
  Session.remove = vi.fn()
  Session.savePostalCode = vi.fn()
  Session.saveUser = vi.fn()

  afterEach(() => {
    Cookie.get.mockClear()
    Session.remove.mockClear()
  })

  it('should initialize all the third party services', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithBanner }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Para tu San Valentín')

    expect(Tracker.initialize).toHaveBeenCalled()
    expect(Support.initialize).toHaveBeenCalled()
  })

  it('should set the postal code properly if the user has postal code', async () => {
    Cookie.get.mockReturnValue({ postalCode: '46010' })
    const responses = [
      {
        path: '/home/?lang=en&wh=vlc1&postal_code=46010',
        responseBody: homeWithBanner,
        catchParams: true,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Para tu San Valentín')
    openUserDropdown()
    const [postalCodeInfoInHeader, postalCodeInfoInCart] =
      screen.getAllByText('Delivery in 46010')

    expect(postalCodeInfoInHeader).toBeInTheDocument()
    expect(postalCodeInfoInCart).toBeInTheDocument()
  })

  it('should clear the session info if the user is not logged', async () => {
    Cookie.get.mockReturnValue({ postalCode: '46010' })
    const responses = [{ path: '/home/', responseBody: homeWithBanner }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Para tu San Valentín')

    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(Session.remove).toHaveBeenCalled()
  })

  it('should set the user data for logged users', async () => {
    Cookie.get.mockReturnValue({ postalCode: '46010' })
    const responses = [
      { path: `/customers/1/home/`, responseBody: homeWithBanner },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Para tu San Valentín')

    expect(screen.getByText('Hello John')).toBeInTheDocument()
    expect(Tracker.identifyExistingUser).toHaveBeenCalledWith('1')
    expect(Session.saveUser).toHaveBeenCalledWith({
      uuid: '1',
      token: 'user-token',
    })
    expect(Support.identify).toHaveBeenCalledWith({
      id: 1,
      uuid: '1',
      email: 'johndoe@gmail.com',
      name: 'John',
      current_postal_code: '46004',
      cart_id: '1234',
      last_name: 'Doe',
    })
  })

  it('should clear the session info if there is an error in the request', async () => {
    Cookie.get.mockReturnValue({ postalCode: '46010' })
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithBanner },
      { path: '/customers/1/', status: 500 },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Para tu San Valentín')

    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(Session.remove).toHaveBeenCalled()
  })
})
