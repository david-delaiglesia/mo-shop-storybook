import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cartWithOneUnpublishedProduct,
  expensiveCart,
} from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { createCheckout, openCart } from 'pages/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Cart', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should send the "start_checkout_click" metric', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          responseBody: expensiveCart,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Estimated cost')
    createCheckout()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'start_checkout_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        price: 170,
        products_count: 1,
        units_count: 200,
        water_liters: 0,
      },
    )
  })

  it('should send the "start_checkout_click" metric calculating the properties without unpublished products', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          responseBody: cartWithOneUnpublishedProduct,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Estimated cost')
    createCheckout()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'start_checkout_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        price: 3,
        products_count: 1,
        units_count: 1,
        water_liters: 18,
      },
    )
  })
})
