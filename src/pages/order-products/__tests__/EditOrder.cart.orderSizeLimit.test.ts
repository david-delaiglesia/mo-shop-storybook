import { screen, within } from '@testing-library/react'

import { confirmOrderEdition } from './helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { MaxSizeAreaExceededException } from 'app/cart'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { mockedOrder } from 'app/order/__tests__/order.mock'
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

describe('Order size limit on edit order', () => {
  it('should show MaxSizeAreaExceededModal when backend throws max_size_area_exceeded on confirmEdition', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
        {
          path: '/customers/1/orders/5/lines/prepared/',
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/orders/1235/cart/?lang=en&wh=vlc1',
          method: 'put',
          status: 400,
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [
                { id: 1, quantity: 2, product_id: '3317', sources: [] },
                { id: 2, quantity: 3, product_id: '71502', sources: [] },
              ],
            },
          },
          responseBody: {
            errors: [
              MaxSizeAreaExceededException.toJSON({
                areas_exceeded: {
                  ambient: true,
                  chilled: false,
                  frozen: false,
                },
              }),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    confirmOrderEdition()

    expect(
      await screen.findByRole('dialog', { name: 'Order too large' }),
    ).toBeInTheDocument()
  })

  it('should close MaxSizeAreaExceededModal when clicking the OK button', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
        {
          path: '/customers/1/orders/5/lines/prepared/',
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/orders/1235/cart/?lang=en&wh=vlc1',
          method: 'put',
          status: 400,
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [
                { id: 1, quantity: 2, product_id: '3317', sources: [] },
                { id: 2, quantity: 3, product_id: '71502', sources: [] },
              ],
            },
          },
          responseBody: {
            errors: [
              MaxSizeAreaExceededException.toJSON({
                areas_exceeded: {
                  ambient: true,
                  chilled: false,
                  frozen: false,
                },
              }),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    confirmOrderEdition()

    const dialog = await screen.findByRole('dialog', {
      name: 'Order too large',
    })
    userEvent.click(within(dialog).getByRole('button', { name: 'OK' }))

    expect(dialog).not.toBeInTheDocument()
  })

  it('should send metric order_size_limit_alert_view when showing the modal', async () => {
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
        {
          path: '/customers/1/orders/5/lines/prepared/',
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/orders/1235/cart/?lang=en&wh=vlc1',
          method: 'put',
          status: 400,
          requestBody: {
            cart: {
              id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
              lines: [
                { id: 1, quantity: 2, product_id: '3317', sources: [] },
                { id: 2, quantity: 3, product_id: '71502', sources: [] },
              ],
            },
          },
          responseBody: {
            errors: [
              MaxSizeAreaExceededException.toJSON({
                areas_exceeded: {
                  ambient: true,
                  chilled: false,
                  frozen: false,
                },
              }),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')
    confirmOrderEdition()

    await screen.findByRole('dialog', { name: 'Order too large' })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'order_size_limit_alert_view',
      {
        dry_exceeded: true,
        chill_exceeded: false,
        frozen_exceeded: false,
      },
    )
  })
})
