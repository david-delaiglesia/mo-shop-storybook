import { screen, within } from '@testing-library/react'

import { addProductToCart, openCart } from '../helpers'
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

it('should add a new product on the cart when the user clicks on the add to cart button', async () => {
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
  const bannerProduct = screen.getByLabelText(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  addProductToCart(bannerProduct)
  openCart()
  const openedCart = screen.getByRole('complementary')

  expect(
    within(openedCart).getByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    ),
  ).toBeInTheDocument()
})

it('should not navigate to the product detail when adding a highlighted product to the cart', async () => {
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
  const bannerProduct = screen.getByLabelText(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  addProductToCart(bannerProduct)
  await screen.findByText('Lists')

  expect(screen.queryByText('Related products')).not.toBeInTheDocument()
})

it('should send the add product click metric', async () => {
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
  const bannerProduct = screen.getByLabelText(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  addProductToCart(bannerProduct)

  const today = new Date().toISOString().split('T')[0]
  expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
    added_amount: 1,
    amount: 0,
    cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
    cart_mode: 'purchase',
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    first_product: true,
    first_product_added_at: expect.stringContaining(today),
    id: '8731',
    merca_code: '8731',
    layout: 'highlighted',
    price: '0,85',
    requires_age_check: false,
    selling_method: 'units',
    source: 'producto-destacado',
  })
})
