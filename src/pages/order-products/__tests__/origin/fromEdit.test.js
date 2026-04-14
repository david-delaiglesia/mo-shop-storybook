import { screen, within } from '@testing-library/react'

import { confirmOrderEdition } from '../helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { orderCartDraft } from 'app/order/__scenarios__/orderCart'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { cloneDeep } from 'utils/objects'
import { expectedRequest } from 'utils/test-utils/requestExpectGenerator'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

beforeEach(() => {
  configure({
    changeRoute: (route) => history.push(route),
  })
})

it('should not delete the cart after confirming edition if the origin is from edit order', async () => {
  const orderCartDraftWithEditOrderOrigin = cloneDeep(orderCartDraft)
  orderCartDraftWithEditOrderOrigin.origin = 'edit_order'
  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/draft/',
        responseBody: orderCartDraftWithEditOrderOrigin,
      },
      {
        path: '/customers/1/orders/5/lines/prepared/',
        responseBody: preparedLines,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Products in my order')
  confirmOrderEdition()
  within(await screen.findByRole('dialog')).findByRole('heading', {
    name: 'Order updated',
    level: 3,
  })

  expect(global.fetch).not.toHaveBeenCalledWith(
    expectedRequest({
      url: '/customers/1/cart/',
      method: 'PUT',
      body: { id: '5529dc8b-0a94-4ae0-8145-de5186b542c6', lines: [] },
    }),
  )
})
