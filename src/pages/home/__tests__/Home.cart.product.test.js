import { screen } from '@testing-library/react'

import { openCart } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cart } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  productBaseDetail,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { openProductDetailFromCart } from 'pages/helpers'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Cart', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
  })

  it('should load the cart product detail for the order warehouse', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        { path: '/customers/1/cart/', responseBody: cart },
        { path: '/products/8731/', responseBody: productBaseDetail },
        {
          path: '/products/8731/xselling/',
          responseBody: productXSelling,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findAllByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    openProductDetailFromCart(
      'Fideos orientales Yakisoba sabor pollo Hacendado, Paquete, 90 Grams, 0,85€ per Unit',
    )
    await screen.findByText('Related products')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/products/8731/?lang=en&wh=vlc1'),
        method: 'GET',
      }),
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(
          '/products/8731/xselling/?lang=en&wh=vlc1&exclude=8731',
        ),
        method: 'GET',
      }),
    )
  })
})
