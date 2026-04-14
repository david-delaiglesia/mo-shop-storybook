import { screen } from '@testing-library/react'

import { openMyRegulars } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { recommendations } from 'app/catalog/__scenarios__/recommendations'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { navigateToShoppingLists } from 'pages/shopping-lists/__tests__/helpers.js'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('My Regulars - Remove products', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should not be able to remove a product from edit order', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    const responses = [
      { path: '/customers/1/orders/1234/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1234/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1234/edit/products')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    navigateToShoppingLists()
    await screen.findByText('My second list')
    openMyRegulars()
    await screen.findByRole('heading', { name: 'My Essentials' })

    expect(screen.queryByLabelText('Remove product')).not.toBeInTheDocument()
  })
})
