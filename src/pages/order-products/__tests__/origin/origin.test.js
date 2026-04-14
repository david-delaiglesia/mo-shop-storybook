import { screen, within } from '@testing-library/react'

import { confirmOrderEdition, searchProducts } from '../helpers'
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
import { addProduct, decreaseProductFromCart } from 'pages/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { expectedRequest } from 'utils/test-utils/requestExpectGenerator'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

beforeEach(() => {
  configure({
    changeRoute: (route) => history.push(route),
  })
})

it('should update the draft and send the origin when the user edits a product', async () => {
  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Products in my order')
  searchProducts('jam')

  await screen.findAllByText('Jamón serrano Hacendado')
  addProduct('Jamón serrano Hacendado')

  expect('/customers/1/orders/1235/cart/draft/').toHaveBeenFetchedWith({
    method: 'PUT',
    body: {
      origin: 'edit_order',
      id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      lines: [
        { quantity: 1, product_id: '58110', sources: ['+SA'] },
        { id: 1, quantity: 2, product_id: '3317', sources: [] },
        { id: 2, quantity: 3, product_id: '71502', sources: [] },
      ],
    },
  })
})

it('should keep the origin the user is increasing and the origin is from_merge_cart', async () => {
  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/draft/',
        responseBody: orderCartDraft,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Products in my order')
  searchProducts('jam')

  await screen.findAllByText('Jamón serrano Hacendado')
  addProduct('Jamón serrano Hacendado')

  expect(global.fetch).toHaveBeenCalledWith(
    expectedRequest({
      url: '/customers/1/orders/1235/cart/draft/',
      method: 'PUT',
      body: {
        origin: 'from_merge_cart',
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          { quantity: 1, product_id: '58110', sources: ['+SA'] },
          { id: 1, quantity: 5, product_id: '3317', sources: [] },
          { id: 2, quantity: 3, product_id: '71502', sources: [] },
        ],
      },
    }),
  )
})

it('should keep the origin if user is decreasing and the origin is from_merge_cart', async () => {
  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/draft/',
        responseBody: orderCartDraft,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Products in my order')

  decreaseProductFromCart('Plataforma mopa grande abrillantadora Bosque Verde')

  expect(global.fetch).toHaveBeenCalledWith(
    expectedRequest({
      url: '/customers/1/orders/1235/cart/draft/',
      method: 'PUT',
      body: {
        origin: 'from_merge_cart',
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          { id: 1, quantity: 5, product_id: '3317', sources: [] },
          { id: 2, quantity: 2, product_id: '71502', sources: ['-CA'] },
        ],
      },
    }),
  )
})

it('should delete the cart after confirming edition if the origin is from merge cart', async () => {
  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/1235/cart/draft/',
        responseBody: orderCartDraft,
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

  expect(global.fetch).toHaveBeenCalledWith(
    expectedRequest({
      url: '/customers/1/cart/',
      method: 'PUT',
      body: { id: '5529dc8b-0a94-4ae0-8145-de5186b542c6', lines: [] },
    }),
  )
})
