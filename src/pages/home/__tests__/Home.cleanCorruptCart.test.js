import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const defaultResponses = [
  { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
  { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
  { path: '/categories/', responseBody: categories },
  { path: '/categories/112/', responseBody: categoryDetail },
  { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
]

describe('Home - Cookie', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const mount = ({ responses = [] } = {}) =>
    wrap(App).atPath('/').withNetwork(responses).mount()

  beforeEach(() => {
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should clean add to ongoing order cart if exists', async () => {
    Storage.setItem('cart_to_ongoing_order', { foo: 'bar' })
    const responses = { path: '/home/', responseBody: homeWithGrid }
    mount({ responses })

    await screen.findByText('Novedades')

    expect(Storage.getItem('cart_to_ongoing_order')).toBeUndefined()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'clean_ongoing_order_cart_on_page_start',
    )
  })

  it('should not clean add to ongoing cart if cart does not exists', async () => {
    Storage.removeItem = vi.fn()
    const responses = { path: '/home/', responseBody: homeWithGrid }
    mount({ responses })

    await screen.findByText('Novedades')

    expect(Storage.removeItem).not.toHaveBeenCalledWith('cart_to_ongoing_order')
    expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
      'clean_ongoing_order_cart_on_page_start',
    )
  })

  it('should not clean add to ongoing order when refreshing edit page', async () => {
    Storage.setItem('cart_to_ongoing_order', orderCart)
    Storage.removeItem = vi.fn()

    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()
    await screen.findByText('Products in my order')

    expect(Storage.getItem('cart_to_ongoing_order')).toEqual(orderCart)
    expect(Storage.removeItem).not.toHaveBeenCalledWith('cart_to_ongoing_order')
    expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
      'clean_ongoing_order_cart_on_page_start',
    )
  })
})
