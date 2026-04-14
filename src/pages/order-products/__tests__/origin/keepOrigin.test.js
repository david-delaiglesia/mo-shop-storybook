import { screen } from '@testing-library/react'

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
import { orderCartDraft } from 'app/order/__scenarios__/orderCart'
import { order } from 'app/order/__scenarios__/orderDetail'
import { addProduct, openCart } from 'pages/helpers'
import { addCartToOngoingOrder } from 'pages/home/__tests__/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { expectedRequest } from 'utils/test-utils/requestExpectGenerator'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('when adding a cart to the current order', () => {
  it('should continue sending the origin from_merge_cart when adding a product from the detail', async () => {
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
        {
          path: '/customers/1/orders/44051/cart/draft/',
          responseBody: orderCartDraft,
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
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    expect(global.fetch).toHaveBeenCalledWith(
      expectedRequest({
        url: '/customers/1/orders/44051/cart/draft/',
        method: 'PUT',
        body: {
          origin: 'from_merge_cart',
          id: '57e2fd9e-d5ce-4f4e-964a-b629fe3c831e',
          lines: [
            { quantity: 201, product_id: '8731', sources: ['+CT'] },
            { quantity: 1, product_id: '28491', sources: [] },
          ],
        },
      }),
    )
  })
})
