import { screen, within } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  address,
  addressFromDifferentWarehouse,
} from 'app/address/__scenarios__/address'
import { cartWithOneUnpublishedProduct } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  cookies,
  cookiesWithMadWarehouse,
} from 'app/cookie/__scenarios__/cookies'
import { clickElementDefaultButton } from 'pages/user-area/__tests__/helpers'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Change hive alert', () => {
  const vlc1PostalCode = '46010'
  const mad1PostalCode = '28001'

  configure({
    changeRoute: (route) => history.push(route),
  })

  const pathnameMock = vi.fn()
  delete global.window.location
  global.window.location = {}
  Object.defineProperty(window.location, 'pathname', {
    set: pathnameMock,
    get: () => pathnameMock,
    configurable: true,
  })

  afterEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
    Storage.clear()
    localStorage.clear()
  })

  it('should check that the trolley has different products and show the modal if there are unpublished products ', async () => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])

    const uuid = '1'
    const responses = [
      {
        path: `/customers/${uuid}/home/?lang=es&wh=vlc1`,
        responseBody: homeWithGrid,
        headers: { 'x-customer-pc': vlc1PostalCode, 'x-customer-wh': 'vlc1' },
      },
      {
        path: `/customers/${uuid}/addresses/?lang=es&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
        headers: { 'x-customer-pc': vlc1PostalCode, 'x-customer-wh': 'vlc1' },
      },
      {
        path: `/customers/${uuid}/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=es&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: { 'x-customer-pc': mad1PostalCode, 'x-customer-wh': 'mad1' },
      },
      {
        path: `/customers/1/cart/?lang=en&wh=mad1`,
        responseBody: cartWithOneUnpublishedProduct,
      },
    ]
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByRole('heading', { level: 1, name: 'Addresses' })

    clickElementDefaultButton('Calle Mayor, 10')
    Cookie.get = vi.fn((cookie) => cookiesWithMadWarehouse[cookie])

    await screen.findByRole('dialog')
    await screen.findByText(
      'When you change the address, some products will no longer be available in your shopping trolley',
    )
    expect('/customers/1/cart/?lang=en&wh=mad1').toHaveBeenFetched()
  })

  it('should change the address check and do not change the page', async () => {
    const uuid = '1'
    const responses = [
      {
        path: `/customers/${uuid}/home/?lang=es&wh=vlc1`,
        responseBody: homeWithGrid,
      },
      {
        path: `/customers/${uuid}/addresses/?lang=es&wh=vlc1`,
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/${uuid}/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=es&wh=vlc1`,
        method: 'patch',
        responseBody: addressFromDifferentWarehouse,
        headers: { 'x-customer-pc': mad1PostalCode, 'x-customer-wh': 'mad1' },
      },
      {
        path: `/customers/1/cart/?lang=en&wh=mad1`,
        responseBody: cartWithOneUnpublishedProduct,
      },
    ]
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByRole('heading', { level: 1, name: 'Addresses' })

    within(screen.getByTestId('other-addresses')).getByText(
      'Calle Mayor, 10. Piso 8 Puerta 14',
    )

    Cookie.get = vi.fn((cookie) => cookiesWithMadWarehouse[cookie])

    within(screen.getByTestId('other-addresses')).findByText(
      'Calle Arquitecto Mora, 10. Piso 8 Puerta 14',
    )

    expect(history.location.pathname).toBe('/user-area/address')
  })
})
