import { screen } from '@testing-library/react'

import { monitoring } from 'monitoring'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  babyFoodSubcategoryDetail,
  categories,
} from 'app/catalog/__scenarios__/categories'
import { order } from 'app/order/__scenarios__/orderDetail'

const defaultResponses = [
  { path: `/customers/1/orders/1235/`, responseBody: order },
  { path: '/categories/', responseBody: categories },
]

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('EditOrder - Error', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should send monitoring error if order content is not rendered after fetching all categories', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      ...defaultResponses,
      {
        path: '/categories/216/',
        responseBody: babyFoodSubcategoryDetail,
      },
    ]
    wrap(App)
      .atPath(
        '/orders/1235/edit/products?category=216&focus-on-detail=category',
      )
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')

    history.push('/orders/1235/edit/products')

    expect(monitoring.captureError).toHaveBeenCalledWith(
      new Error('Fail to retrieve the order content'),
    )
  })

  it('should NOT render category detail page if categories are loading', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      { path: `/customers/1/orders/1235/`, responseBody: order },
      { path: '/categories/', responseBody: categories, delay: 500 },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Modify order')
    expect(
      screen.queryByTestId('edit-order-products-container'),
    ).not.toBeInTheDocument()
  })
})
