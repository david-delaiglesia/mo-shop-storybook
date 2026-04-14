import { screen, within } from '@testing-library/react'

import {
  acceptRemoveOrder,
  cancelRemoveOrder,
  confirmOrderEdition,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { orderCartWithOneProduct } from 'app/order/__scenarios__/orderCart'
import { order } from 'app/order/__scenarios__/orderDetail'
import { mockedCompleteOrderLine } from 'app/order/__tests__/preparedOrderLines.mock'
import { removeProductFromCart } from 'pages/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order - Remove all products', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })
  const responses = [
    { path: '/customers/1/orders/44051/', responseBody: order },
    {
      path: '/customers/1/orders/44051/cart/',
      responseBody: orderCartWithOneProduct,
    },
    { path: '/categories/', responseBody: categories },
    { path: '/categories/112/', responseBody: categoryDetail },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]

  it('should display the remove order alert', async () => {
    wrap(App)
      .atPath('/orders/44051/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')

    removeProductFromCart('Plataforma mopa grande abrillantadora Bosque Verde')

    confirmOrderEdition()
    const alert = screen.getByRole('dialog')
    expect(
      within(alert).getByText('Do you want to cancel your order?'),
    ).toBeInTheDocument()
    expect(
      within(alert).getByText(
        'You will lose your reserved delivery date and timeslot.',
      ),
    ).toBeInTheDocument()
    expect(
      within(alert).getByRole('button', { name: 'Cancel order' }),
    ).toBeInTheDocument()
    expect(
      within(alert).getByRole('button', { name: 'Go back' }),
    ).toBeInTheDocument()
    expect(Tracker.sendInteraction).toBeCalledWith(
      'remove_all_products_cancel_order_modal_view',
      {
        order_id: 44051,
      },
    )
  })

  it('should display the remove order alert and cancel to stay in the same page', async () => {
    wrap(App)
      .atPath('/orders/44051/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')

    removeProductFromCart('Plataforma mopa grande abrillantadora Bosque Verde')

    confirmOrderEdition()
    const alert = screen.getByRole('dialog')
    cancelRemoveOrder(alert)
    expect(alert).not.toBeInTheDocument()
    expect(screen.getByText('Products in my order')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toBeCalledWith(
      'remove_all_products_cancel_order_modal_close',
      {
        order_id: 44051,
        option: 'back',
      },
    )
  })

  it('should display the remove order alert and accept to remove the order', async () => {
    const cancelResponses = [
      ...responses,
      {
        path: '/customers/1/orders/44051/?lang=en&wh=vlc1',
        method: 'delete',
        responseBody: {
          ...order,
          status: 'cancelled_by_customer',
          status_ui: 'cancelled_by_customer',
        },
      },
      {
        path: '/customers/1/orders/44051/lines/prepared/?lang=en&wh=vlc1',
        responseBody: { results: mockedCompleteOrderLine },
      },
    ]
    wrap(App)
      .atPath('/orders/44051/edit/products/')
      .withNetwork(cancelResponses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')

    removeProductFromCart('Plataforma mopa grande abrillantadora Bosque Verde')
    confirmOrderEdition()
    const alert = screen.getByRole('dialog')
    acceptRemoveOrder(alert)
    expect(Tracker.sendInteraction).toBeCalledWith(
      'remove_all_products_cancel_order_modal_close',
      {
        order_id: 44051,
        option: 'cancel_order',
      },
    )
    expect('/customers/1/orders/44051/?lang=en&wh=vlc1').toHaveBeenFetched()

    expect(await screen.findByText('My orders')).toBeInTheDocument()
  })
})
