import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithBanner } from 'app/catalog/__scenarios__/home'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Authenticate - Redirect', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should display the login modal accessing to login page', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithBanner }]
    wrap(App).atPath('/authenticate-user').withNetwork(responses).mount()

    const dialog = await screen.findByRole('dialog')

    expect(dialog).toContainElement(screen.getByText('Enter your email'))
    expect(window.location.pathname).toBe('/')
    expect(window.location.search).toBe('?authenticate-user=')
  })

  it('should display the login page accessing to the checkout', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithBanner }]
    wrap(App).atPath('/checkout/1').withNetwork(responses).mount()

    const dialog = await screen.findByRole('dialog')

    expect(dialog).toContainElement(screen.getByText('Enter your email'))
  })

  it('should display the login page accessing to the purchase confirmation', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithBanner }]
    wrap(App)
      .atPath('/purchases/52316/confirmation')
      .withNetwork(responses)
      .mount()

    const dialog = await screen.findByRole('dialog')

    expect(dialog).toContainElement(screen.getByText('Enter your email'))
  })

  it('should display the login page accessing to the edit order', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithBanner }]
    wrap(App)
      .atPath('/orders/1234/edit/products')
      .withNetwork(responses)
      .mount()

    const dialog = await screen.findByRole('dialog')

    expect(dialog).toContainElement(screen.getByText('Enter your email'))
  })

  it('should display the login page accessing to the orders in the user area', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithBanner }]
    wrap(App).atPath('/user-area/orders').withNetwork(responses).mount()

    const dialog = await screen.findByRole('dialog')

    expect(dialog).toContainElement(screen.getByText('Enter your email'))
  })

  it('should display the login page accessing to the order detail in the user area', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithBanner }]
    wrap(App).atPath('/user-area/orders/1234').withNetwork(responses).mount()

    const dialog = await screen.findByRole('dialog')

    expect(dialog).toContainElement(screen.getByText('Enter your email'))
  })

  it('should display the login page accessing to the personal info in the user area', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithBanner }]
    wrap(App).atPath('/user-area/personal-info').withNetwork(responses).mount()

    const dialog = await screen.findByRole('dialog')

    expect(dialog).toContainElement(screen.getByText('Enter your email'))
  })

  it('should display the login page accessing to the personal info in the user area', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithBanner }]
    wrap(App).atPath('/user-area/address').withNetwork(responses).mount()

    const dialog = await screen.findByRole('dialog')

    expect(dialog).toContainElement(screen.getByText('Enter your email'))
  })

  it('should display the login page accessing to the payment methods in the user area', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithBanner }]
    wrap(App).atPath('/user-area/payments').withNetwork(responses).mount()

    const dialog = await screen.findByRole('dialog')

    expect(dialog).toContainElement(screen.getByText('Enter your email'))
  })

  it('should display the login page accessing after receiving a unauthorized status code', async () => {
    delete global.window.location
    global.window.location = {
      reload: vi.fn(),
    }
    const responses = [
      { path: '/home/', responseBody: homeWithBanner, status: 401 },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    const dialog = await screen.findByRole('dialog')

    expect(dialog).toContainElement(screen.getByText('Enter your email'))
  })
})
