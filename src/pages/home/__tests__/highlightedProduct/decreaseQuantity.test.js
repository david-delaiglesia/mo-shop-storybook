import { screen, within } from '@testing-library/react'

import { addProductToCart, decreaseProductInCart } from '../helpers'
import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import { emptyCart } from 'app/cart/__scenarios__/cart'
import { homeWithBannerProduct } from 'app/catalog/__scenarios__/home'
import { productBaseDetail } from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

it('should allow to decrement the highlighted product quantity', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithBannerProduct },
      { path: '/customers/1/cart/', responseBody: emptyCart },

      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Lists')
  const highlightedProductBanner = screen.getByLabelText(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  addProductToCart(highlightedProductBanner)
  addProductToCart(highlightedProductBanner)
  decreaseProductInCart(highlightedProductBanner)

  expect(
    within(highlightedProductBanner).getByText('1 unit'),
  ).toBeInTheDocument()
})

it('should allow to decrement the highlighted product quantity', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithBannerProduct },
      { path: '/customers/1/cart/', responseBody: emptyCart },

      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Lists')
  const highlightedProductBanner = screen.getByLabelText(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  addProductToCart(highlightedProductBanner)
  addProductToCart(highlightedProductBanner)
  decreaseProductInCart(highlightedProductBanner)

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'decrease_product_click',
    {
      decreased_amount: 1,
      amount: 2,
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      cart_mode: 'purchase',
      display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
      id: '8731',
      merca_code: '8731',
      layout: 'highlighted',
      price: '0,85',
      requires_age_check: false,
      selling_method: 'units',
      source: 'producto-destacado',
    },
  )
})
