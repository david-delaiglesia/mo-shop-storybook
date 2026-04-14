import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { orderCartWithAlcohol } from 'app/order/__scenarios__/orderCart'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order with delay - Cart', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should display the save changes button disabled before the cart is loaded', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/?category=112')
      .withNetwork([
        { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
        {
          path: '/customers/1/orders/1235/cart/',
          responseBody: orderCartWithAlcohol,
        },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin()
      .mount()

    expect(
      await screen.findByRole('button', { name: 'Save changes' }),
    ).toBeEnabled()
  })

  it('should display the save changes button disabled before the cart is loaded', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/?category=112')
      .withNetwork([
        { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
        {
          path: '/customers/1/orders/1235/cart/',
          responseBody: orderCartWithAlcohol,
          delay: 1000,
        },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin()
      .mount()

    expect(
      await screen.findByRole('button', { name: 'Save changes' }),
    ).toBeDisabled()
  })
})
