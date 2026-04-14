import { screen } from '@testing-library/react'

import { closeCart, closeCartClickingOutside, openCart } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cart } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Cart - UI', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
  })

  it('should not display the overlay if the cart is closed', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cart,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')

    const overlay = screen.getByTestId('overlay-container')
    const cartSidebar = screen.getByLabelText('Cart')
    expect(overlay).not.toHaveClass('overlay--show')
    expect(cartSidebar).not.toHaveClass('cart--open')
  })

  it('should display the overlay if the cart is closed', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cart,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')
    openCart()

    const overlay = screen.getByTestId('overlay-container')
    const cartSidebar = screen.getByLabelText('Cart')
    expect(overlay).toHaveClass('overlay--show')
    expect(cartSidebar).toHaveClass('cart--open')
  })

  it('should close the cart clicking outside', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cart,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')
    openCart()
    closeCartClickingOutside()

    const overlay = screen.getByTestId('overlay-container')
    const cartSidebar = screen.getByLabelText('Cart')
    expect(overlay).not.toHaveClass('overlay--show')
    expect(cartSidebar).not.toHaveClass('cart--open')
  })

  it('should block the scroll when the cart is open', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cart,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')
    openCart()

    expect(document.body).toHaveClass('scroll--block')
  })

  it('should unblock the scroll when the cart is closed', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cart,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')
    openCart()
    closeCart()

    expect(document.body).not.toHaveClass('scroll--block')
  })
})
