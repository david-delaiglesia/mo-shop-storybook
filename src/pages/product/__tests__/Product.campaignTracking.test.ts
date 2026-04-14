import { screen } from '@testing-library/react'

import { addPrivateProductToCart } from './helpers'
import { configure, wrap } from 'wrapito'

import { App } from 'app'
import { history } from 'app'
import {
  productBaseDetail,
  productWithoutXSelling,
} from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

afterEach(() => {
  vi.clearAllMocks()
})

beforeEach(() => {
  Cookie.get = vi.fn((cookie: string) => cookies[cookie]) as <CookieValueType>(
    cookieName: string,
  ) => CookieValueType
})

it('should NOT track the campaign if present as a query param when visiting a product', async () => {
  const responses = [
    { path: '/products/8731/', responseBody: productBaseDetail },
    {
      path: '/products/8731/xselling/',
      responseBody: productWithoutXSelling,
    },
  ]
  wrap(App).atPath('/product/8731').withNetwork(responses).mount()

  await screen.findByAltText(
    'Main product image Fideos orientales Yakisoba sabor pollo Hacendado',
  )

  expect(Tracker.sendViewChange).toHaveBeenCalledWith('product', {
    public_mode: false,
  })
})

it('should track the campaign if present as a query param when visiting a product', async () => {
  const responses = [
    { path: '/products/8731/', responseBody: productBaseDetail },
  ]
  wrap(App)
    .atPath('/product/8731?campaign=verano')
    .withNetwork(responses)
    .mount()

  await screen.findByAltText(
    'Main product image Fideos orientales Yakisoba sabor pollo Hacendado',
  )

  expect(Tracker.sendViewChange).toHaveBeenCalledWith('product', {
    public_mode: false,
    campaign: 'verano',
  })
})

it('should track the campaign if present as a query param when adding a product to the cart', async () => {
  const today = new Date().toISOString().split('T')[0]
  const metrics = {
    amount: 0,
    cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    id: '8731',
    merca_code: '8731',
    layout: 'product_detail',
    price: '0,85',
    requires_age_check: false,
    selling_method: 'units',
    source: 'product',
    cart_mode: 'purchase',
  }
  const responses = [
    { path: '/products/8731/', responseBody: productBaseDetail },
  ]
  wrap(App)
    .atPath(
      '/product/8731/fideos-orientales-yakisoba-sabor-pollo-hacendado-paquete?campaign=verano',
    )
    .withNetwork(responses)
    .withLogin()
    .mount()

  await screen.findByText('Descripción Fideos orientales Yakisoba sabor pollo')
  addPrivateProductToCart()
  await screen.findAllByText('1 unit')

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
    ...metrics,
    first_product_added_at: expect.stringContaining(today),
    first_product: true,
    added_amount: 1,
    campaign: 'verano',
  })
})
