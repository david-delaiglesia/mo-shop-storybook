import { screen, waitFor } from '@testing-library/react'

import { confirmOrderEdition } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { MinPurchaseAmountNotReachedException } from 'app/cart'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { decreaseProductFromCart, removeProductFromCart } from 'pages/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('Minimum purchase amount', () => {
  it('should NOT display the minimum purchase amount if the backend does not throw an error', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
        {
          path: `/customers/1/orders/5/lines/prepared/`,
          responseBody: preparedLines,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    decreaseProductFromCart(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )
    decreaseProductFromCart(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )
    removeProductFromCart('Plataforma mopa grande abrillantadora Bosque Verde')
    confirmOrderEdition()

    await waitFor(() => {
      expect(
        screen.queryByRole('dialog', {
          name: 'Minimum order. Remember, the minimum amount of the products in order to make changes is € 50',
        }),
      ).not.toBeInTheDocument()
    })
  })

  it('should display the minimum purchase amount when the backend throws the error min_purchase_amount_in_cart_not_reached_error', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
        {
          path: `/customers/1/orders/5/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/orders/1235/cart/?lang=en&wh=vlc1',
          method: 'put',
          status: 400,
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [{ id: 1, quantity: 2, product_id: '3317', sources: [] }],
            },
          },
          responseBody: {
            errors: [
              MinPurchaseAmountNotReachedException.toJSON({
                detail:
                  'Remember that to place your order the minimum amount is €60',
              }),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    decreaseProductFromCart(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )
    decreaseProductFromCart(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )
    removeProductFromCart('Plataforma mopa grande abrillantadora Bosque Verde')
    confirmOrderEdition()

    expect(
      await screen.findByRole('dialog', {
        name: 'Minimum order. Remember that to place your order the minimum amount is €60',
      }),
    ).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('minimum_price_alert', {
      cart_mode: 'edit',
      price: 21.1,
    })
  })
})
