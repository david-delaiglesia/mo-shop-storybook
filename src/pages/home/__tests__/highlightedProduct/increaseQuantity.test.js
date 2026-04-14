import { screen, within } from '@testing-library/react'

import { addProductToCart } from '../helpers'
import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import { emptyCart } from 'app/cart/__scenarios__/cart'
import { homeWithBannerProduct } from 'app/catalog/__scenarios__/home'
import {
  productBaseDetail,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

it('should increment the quantity when adding a product to the cart', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithBannerProduct },
      { path: '/customers/1/cart/', responseBody: emptyCart },

      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Lists')
  const highlightedProductBanner = screen.getByLabelText(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  addProductToCart(highlightedProductBanner)

  expect(
    within(highlightedProductBanner).getByText('1 unit'),
  ).toBeInTheDocument()
})
