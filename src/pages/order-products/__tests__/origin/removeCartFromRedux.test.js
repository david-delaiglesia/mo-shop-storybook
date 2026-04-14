import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cartWithOngoingOrder,
  expensiveCartRequest,
  mergedCart,
  orderCart,
} from 'app/cart/__scenarios__/cart'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { homeWithWidget } from 'app/catalog/__scenarios__/home'
import { orderCartDraft } from 'app/order/__scenarios__/orderCart'
import { order, preparedLines } from 'app/order/__scenarios__/orderDetail'
import { addCartToOngoingOrder, openCart } from 'pages/home/__tests__/helpers'
import { confirmOrderEdition } from 'pages/order-products/__tests__/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

it('should remove the cart from redux when confirming a merge to cart order', async () => {
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
        path: '/customers/1/cart/',
        responseBody: cartWithOngoingOrder,
      },
      { path: '/customers/1/orders/44051/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/44051/cart/draft/',
        responseBody: orderCartDraft,
      },
      {
        path: `/customers/1/orders/${order.id}/lines/prepared/`,
        responseBody: preparedLines,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Próxima entrega')
  openCart()
  await screen.findByText('Add to current order')
  addCartToOngoingOrder()
  await screen.findByText('Products in my order')
  Storage.removeItem(STORAGE_KEYS.CART_TO_ONGOING_ORDER)
  confirmOrderEdition()
  await screen.findByRole('dialog')

  expect(screen.getByLabelText('Show cart')).toHaveOnlyIcon()
})

it('should not remove the cart from redux when confirming a merge to cart order with the origin to null', async () => {
  const orderCartDraftCopy = cloneDeep(orderCartDraft)
  orderCartDraftCopy.origin = null
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
        path: '/customers/1/cart/',
        responseBody: cartWithOngoingOrder,
      },
      { path: '/customers/1/orders/44051/cart/', responseBody: orderCart },
      {
        path: '/customers/1/orders/44051/cart/draft/',
        responseBody: orderCartDraftCopy,
      },
      {
        path: `/customers/1/orders/${order.id}/lines/prepared/`,
        responseBody: preparedLines,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Próxima entrega')
  openCart()
  await screen.findByText('Add to current order')
  addCartToOngoingOrder()
  await screen.findByText('Products in my order')
  Storage.removeItem(STORAGE_KEYS.CART_TO_ONGOING_ORDER)
  confirmOrderEdition()
  await screen.findByRole('dialog')

  expect(screen.queryByLabelText('Show cart')).not.toHaveOnlyIcon()
})
