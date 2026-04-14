import { screen } from '@testing-library/react'

import { wrap } from 'wrapito'

import { App } from 'app'
import {
  address,
  addressFromDifferentWarehouse,
} from 'app/address/__scenarios__/address'
import {
  homeWithGrid,
  homeWithGridAndProductNotAvailableInMad,
} from 'app/catalog/__scenarios__/home'
import {
  cookies,
  cookiesWithMadWarehouse,
} from 'app/cookie/__scenarios__/cookies'
import { cancelLoginSuggestion } from 'pages/authenticate-user/__tests__/helpers'
import { addProduct } from 'pages/helpers'
import { goToHome } from 'pages/home/__tests__/helpers.js'
import { navigateToShoppingLists } from 'pages/shopping-lists/__tests__/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'
import { Session } from 'services/session'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

beforeAll(() => {
  vi.useFakeTimers()
})

afterAll(() => {
  vi.useRealTimers()
})

it('should change the warehouse and update the catalog and the postalCode of the delivery', async () => {
  Cookie.get = vi.fn((cookie) => cookiesWithMadWarehouse[cookie])
  Session.saveWarehouse = vi.fn()
  Session.savePostalCode = vi.fn()

  wrap(App)
    .atPath('/')
    .withNetwork([
      {
        path: '/home/?lang=en&wh=vlc1',
        responseBody: homeWithGridAndProductNotAvailableInMad,
        headers: { 'x-customer-wh': 'vlc1' },
      },
      {
        path: `/addresses/?lang=en&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: '/home/?lang=en&wh=mad1',
        responseBody: homeWithGrid,
      },
    ])
    .mount()

  await screen.findByLabelText('Show cart')

  expect(
    screen.queryByText('Products not available at this address'),
  ).not.toBeInTheDocument()
  expect(Session.saveWarehouse).toHaveBeenCalledWith('vlc1')
})

it('should display the products not available dialog only when the cart is not empty', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  Session.saveWarehouse = vi.fn()
  Session.savePostalCode = vi.fn()

  wrap(App)
    .atPath('/')
    .withNetwork([
      {
        path: '/home/?lang=en&wh=vlc1',
        responseBody: homeWithGridAndProductNotAvailableInMad,
        headers: { 'x-customer-pc': '46001', 'x-customer-wh': 'vlc1' },
      },
      {
        path: `/addresses/?lang=en&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: '/home/?lang=en&wh=mad1',
        responseBody: homeWithGrid,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .mount()

  await screen.findByText('Novedades')
  addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  await screen.findAllByRole('dialog')
  cancelLoginSuggestion()
  navigateToShoppingLists()
  await screen.findByRole('button', { name: 'Login' })
  Cookie.get = vi.fn((cookie) => cookiesWithMadWarehouse[cookie])
  goToHome()
  await screen.findByText('Novedades')

  expect(
    screen.queryByText('Products not available at this address'),
  ).toBeInTheDocument()
})
