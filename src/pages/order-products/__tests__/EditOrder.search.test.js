import { screen } from '@testing-library/react'

import { searchProducts } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import {
  decreaseProduct,
  getProductCell,
  increaseProduct,
  removeProduct,
} from 'pages/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order - Search', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  const searchMetrics = {
    amount: 0,
    cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
    display_name: 'Jamón serrano Hacendado',
    id: '58110',
    merca_code: '58110',
    layout: 'grid',
    price: '39,00',
    requires_age_check: false,
    selling_method: 'units',
    source: 'search',
    cart_mode: 'edit',
  }

  it('should display the searched products', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    searchProducts('jam')
    await screen.findByText('Jamón serrano Hacendado')

    const product = getProductCell('Jamón serrano Hacendado')
    expect(product).toHaveTextContent('39,00 €')
  })

  it('should be able to add product from the search', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    searchProducts('jam')
    await screen.findByText('Jamón serrano Hacendado')
    increaseProduct('Jamón serrano Hacendado')

    const product = getProductCell('Jamón serrano Hacendado')
    expect(product).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      ...searchMetrics,
      order: 0,
      added_amount: 1,
      first_product: false,
      query: 'jam',
    })
  })

  it('should be able to decrease product from the search', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    searchProducts('jam')
    await screen.findByText('Jamón serrano Hacendado')
    increaseProduct('Jamón serrano Hacendado')
    increaseProduct('Jamón serrano Hacendado')
    decreaseProduct('Jamón serrano Hacendado')

    const product = getProductCell('Jamón serrano Hacendado')
    expect(product).toHaveTextContent('1 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...searchMetrics,
        amount: 2,
        decreased_amount: 1,
      },
    )
  })

  it('should be able to remove product from the search', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    searchProducts('jam')
    await screen.findByText('Jamón serrano Hacendado')
    increaseProduct('Jamón serrano Hacendado')
    removeProduct('Jamón serrano Hacendado')

    const product = getProductCell('Jamón serrano Hacendado')
    expect(product).toHaveTextContent('0 unit')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      {
        ...searchMetrics,
        amount: 1,
        decreased_amount: 1,
      },
    )
  })

  it('should scroll to top after a new search', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    searchProducts('jam')
    await screen.findByText('Jamón serrano Hacendado')

    expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith(0, 0)
  })
})
