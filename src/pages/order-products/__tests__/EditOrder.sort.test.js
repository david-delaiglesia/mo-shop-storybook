import { screen } from '@testing-library/react'

import { openSortingDropdown } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { sortByCategory } from 'pages/home/__tests__/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order - Sort', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should display sorting options', async () => {
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

    const sortTitle = await screen.findByText('Sort')

    expect(sortTitle).toBeInTheDocument()
  })

  it('should open a dropdown list with order options', async () => {
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

    await screen.findByText('Sort')
    openSortingDropdown()
    const sortingMethods = await screen.findByTestId('dropdown-content')

    expect(sortingMethods).toBeInTheDocument()
    expect(sortingMethods).toHaveTextContent('As they were added')
    expect(sortingMethods).toHaveTextContent('By category')
  })

  it('should sort products by category', async () => {
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

    await screen.findByText('Sort')
    openSortingDropdown()
    sortByCategory()

    expect(screen.getByText('Arroz, legumbres y pasta')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'cart_sorting_method_click',
      {
        method: 'categories',
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      },
    )
  })
})
