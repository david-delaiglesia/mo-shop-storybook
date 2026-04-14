import { screen, within } from '@testing-library/react'

import { setOffline, setOnline } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cartApiResponse,
  cartWithVersionApiResponse,
} from 'app/cart/__tests__/cart.mock'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { getProductCellFromCart, increaseProductFromCart } from 'pages/helpers'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Network', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const uuid = '0324234asf'

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should display the offline alert', async () => {
    const responses = [
      { path: `/customers/${uuid}/home/`, responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByLabelText('Show cart')

    setOffline()

    expect(
      screen.getByText('It seems that you have lost your internet connection.'),
    ).toBeInTheDocument()
  })

  it('should hide the offline alert when the network is recovered', async () => {
    const responses = [
      { path: `/customers/${uuid}/home/`, responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByLabelText('Show cart')
    setOffline()
    const offlineAlert = screen.getByText(
      'It seems that you have lost your internet connection.',
    )
    setOnline()

    expect(offlineAlert).not.toBeInTheDocument()
  })

  it('should call cart update during an offline period if cart has changed', async () => {
    const responses = [
      { path: `/customers/${uuid}/home/`, responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponse,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { quantity: 2, product_id: '3317', sources: [] },
            { quantity: 4, product_id: '71502', sources: ['+CA'] },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByLabelText('Show cart')
    const productCell = getProductCellFromCart(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )
    await within(productCell).findByText('3 packs')
    setOffline()

    increaseProductFromCart(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )
    await within(productCell).findByText('4 packs')
    setOnline()

    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          { quantity: 2, product_id: '3317', sources: [] },
          { quantity: 4, product_id: '71502', sources: ['+CA'] },
        ],
      },
    })
  })

  it('should not call cart update during an offline period if cart has not changed', async () => {
    const responses = [
      { path: `/customers/${uuid}/home/`, responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartWithVersionApiResponse,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByLabelText('Show cart')
    const productCell = getProductCellFromCart(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )
    await within(productCell).findByText('3 packs')
    setOffline()
    setOnline()

    expect('/customers/1/cart/').not.toHaveBeenFetchedWith({
      method: 'PUT',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          { quantity: 2, product_id: '3317', sources: [] },
          { quantity: 3, product_id: '71502', sources: [] },
        ],
      },
    })
  })
})
