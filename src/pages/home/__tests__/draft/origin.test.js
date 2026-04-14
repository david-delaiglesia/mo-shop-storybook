import { screen } from '@testing-library/react'

import { addCartToOngoingOrder } from '../helpers'
import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import {
  cartWithOngoingOrder,
  expensiveCartRequest,
  mergedCart,
} from 'app/cart/__scenarios__/cart'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { homeWithWidget } from 'app/catalog/__scenarios__/home'
import { order } from 'app/order/__scenarios__/orderDetail'
import { openCart } from 'pages/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

it('should send the origin from_merge_cart when adding products to the current order', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithWidget },
      {
        path: '/customers/1/orders/44051/cart/validate-merge/',
        method: 'post',
        requestBody: expensiveCartRequest,
        responseBody: { ...mergedCart },
      },
      {
        path: '/customers/1/orders/44051/',
        responseBody: { ...order },
      },
      { path: '/categories/', responseBody: categories },
      {
        path: `/categories/${categoryDetail.id}/`,
        responseBody: categoryDetail,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin({ cart: cartWithOngoingOrder })
    .mount()

  await screen.findByText('Próxima entrega')
  openCart()
  await screen.findByText('Add to current order')
  addCartToOngoingOrder()
  await screen.findByText('Products in my order')

  expect(
    '/customers/1/orders/44051/cart/draft/?lang=en&wh=vlc1',
  ).toHaveBeenFetchedWith({
    method: 'PUT',
    body: {
      origin: 'from_merge_cart',
      id: '57e2fd9e-d5ce-4f4e-964a-b629fe3c831e',
      lines: [
        { quantity: 200, product_id: '8731', sources: [] },
        { quantity: 1, product_id: '28491', sources: [] },
      ],
    },
  })
})
