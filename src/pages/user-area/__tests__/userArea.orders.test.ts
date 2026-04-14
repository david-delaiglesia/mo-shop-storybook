import { screen, within } from '@testing-library/react'

import {
  cancelRepeatOrder,
  confirmRepeatOrder,
  downloadTicket,
  goToCategories,
  goToEditOrder,
  repeatOrder,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { repeatOrderLines } from 'app/cart/__scenarios__/cart'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { order } from 'app/order/__scenarios__/orderDetail'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Orders List', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Storage.clear()
    vi.clearAllMocks()
  })

  describe('when the list does not have orders', () => {
    it('should show the properly info', async () => {
      wrap(App)
        .atPath('/user-area/orders')
        .withNetwork([
          { path: '/customers/1/orders/', responseBody: { results: [] } },
        ])
        .withLogin()
        .mount()

      await screen.findByText('You have not yet made your first order.')

      expect(
        screen.getByText('You have not yet made your first order.'),
      ).toBeInTheDocument()
      expect(
        screen.getByText("Here you'll see the list of your orders"),
      ).toBeInTheDocument()
    })

    it('should navigate to categories page', async () => {
      wrap(App)
        .atPath('/user-area/orders')
        .withNetwork([
          { path: '/customers/1/orders/', responseBody: { results: [] } },
          { path: '/categories/', responseBody: categories },
          { path: '/categories/112/', responseBody: categoryDetail },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Start your order')
      goToCategories()
      const categoryTitle = await screen.findByText('Aceite de oliva')

      expect(categoryTitle).toBeInTheDocument()
    })
  })

  it('should see the ongoing order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.confirmed()],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    const ongoingOrder = screen.getByLabelText('ongoing-order-cell')

    expect(ongoingOrder).toHaveTextContent(
      'Delivery on Wednesday, 26 of February',
    )
    expect(ongoingOrder).toHaveTextContent('from 18:00 to 19:00')
    expect(ongoingOrder).toHaveTextContent('CONFIRMED')
    expect(ongoingOrder).toHaveTextContent('Order 44051')
    expect(ongoingOrder).toHaveTextContent('Estimated total 70,96 €')
    expect(ongoingOrder).toHaveTextContent('View products')
    expect(ongoingOrder).toHaveTextContent('Modify order')
    expect(ongoingOrder).not.toHaveTextContent('Download ticket')
    expect(ongoingOrder).not.toHaveTextContent('Repeat order')
  })

  it('should see the preparing order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.preparing()],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    const preparingOrder = screen.getByLabelText('preparing-order-cell')

    expect(preparingOrder).toHaveTextContent(
      'Delivery on Wednesday, 26 of February',
    )
    expect(preparingOrder).toHaveTextContent('from 18:00 to 19:00')
    expect(preparingOrder).toHaveTextContent('PREPARING')
    expect(preparingOrder).toHaveTextContent('View products')
    expect(preparingOrder).toHaveTextContent('Order 44051')
    expect(preparingOrder).toHaveTextContent('Estimated total 70,96 €')
    expect(preparingOrder).not.toHaveTextContent('Download ticket')
    expect(preparingOrder).not.toHaveTextContent('Repeat order')
    expect(preparingOrder).not.toHaveTextContent('Modify order')
  })

  it('should see the prepared order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.preparedPaid()],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    const preparedOrder = screen.getByLabelText('prepared-order-cell')

    expect(preparedOrder).toHaveTextContent(
      'Delivery on Wednesday, 26 of February',
    )
    expect(preparedOrder).toHaveTextContent('from 18:00 to 19:00')
    expect(preparedOrder).toHaveTextContent('PREPARED')
    expect(preparedOrder).toHaveTextContent('View products')
    expect(preparedOrder).toHaveTextContent('Order 44051')
    expect(preparedOrder).toHaveTextContent('Total 70,96 €')
    expect(preparedOrder).not.toHaveTextContent('Download ticket')
    expect(preparedOrder).not.toHaveTextContent('Repeat order')
    expect(preparedOrder).not.toHaveTextContent('Modify order')
  })

  it('should see the delivering order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.delivering()],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    const deliveringOrder = screen.getByLabelText('delivering-order-cell')

    expect(deliveringOrder).toHaveTextContent(
      'Delivery on Wednesday, 26 of February',
    )
    expect(deliveringOrder).toHaveTextContent('from 18:00 to 19:00')
    expect(deliveringOrder).toHaveTextContent('OUT FOR DELIVERY')
    expect(deliveringOrder).toHaveTextContent('View products')
    expect(deliveringOrder).toHaveTextContent('Order 44051')
    expect(deliveringOrder).toHaveTextContent('Total 70,96 €')
    expect(deliveringOrder).not.toHaveTextContent('Download ticket')
    expect(deliveringOrder).not.toHaveTextContent('Repeat order')
    expect(deliveringOrder).not.toHaveTextContent('Modify order')
  })

  it('should see the delivered order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.delivered()],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    const deliveredOrder = screen.getByLabelText('delivered-order-cell')

    expect(deliveredOrder).toHaveTextContent('Delivered on 26 de February')
    expect(deliveredOrder).toHaveTextContent('DELIVERED')
    expect(deliveredOrder).toHaveTextContent('Download ticket')
    expect(deliveredOrder).toHaveTextContent('View products')
    expect(deliveredOrder).toHaveTextContent('Repeat order')
    expect(deliveredOrder).toHaveTextContent('Order 44051')
    expect(deliveredOrder).toHaveTextContent('Total 70,96 €')
    expect(deliveredOrder).not.toHaveTextContent('from 18:00 to 19:00')
    expect(deliveredOrder).not.toHaveTextContent('Modify order')
  })

  it('should see the cancelled by user order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.cancelledByUser()],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    const cancelledOrder = screen.getByLabelText('cancelled-order-cell')

    expect(cancelledOrder).toHaveTextContent('Cancelled')
    expect(cancelledOrder).toHaveTextContent('CANCELLED')
    expect(cancelledOrder).toHaveTextContent('View products')
    expect(cancelledOrder).toHaveTextContent('Repeat order')
    expect(cancelledOrder).toHaveTextContent('Order 44051')
    expect(cancelledOrder).toHaveTextContent('Estimated total 70,96 €')
    expect(cancelledOrder).not.toHaveTextContent('February')
    expect(cancelledOrder).not.toHaveTextContent('from 18:00 to 19:00')
    expect(cancelledOrder).not.toHaveTextContent('Download ticket')
    expect(cancelledOrder).not.toHaveTextContent('Modify order')
  })

  it('should see the cancelled by edit order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.cancelledBySystem()],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    const cancelledOrder = screen.getByLabelText('cancelled-order-cell')

    expect(cancelledOrder).toHaveTextContent('Cancelled')
    expect(cancelledOrder).toHaveTextContent('CANCELLED')
    expect(cancelledOrder).toHaveTextContent('View products')
    expect(cancelledOrder).toHaveTextContent('Repeat order')
    expect(cancelledOrder).toHaveTextContent('Order 44051')
    expect(cancelledOrder).toHaveTextContent('Estimated total 70,96 €')
    expect(cancelledOrder).not.toHaveTextContent('February')
    expect(cancelledOrder).not.toHaveTextContent('from 18:00 to 19:00')
    expect(cancelledOrder).not.toHaveTextContent('Download ticket')
    expect(cancelledOrder).not.toHaveTextContent('Modify order')
  })

  it('should see the disrupted by user order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.userUnreachable()],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    const disruptedOrder = screen.getByLabelText('disrupted-order-cell')

    expect(disruptedOrder).toHaveTextContent(
      'Delivery on Wednesday, 26 of February',
    )
    expect(disruptedOrder).toHaveTextContent('from 18:00 to 19:00')
    expect(disruptedOrder).toHaveTextContent('INCIDENT')
    expect(disruptedOrder).toHaveTextContent('Order 44051')
    expect(disruptedOrder).toHaveTextContent('Total 70,96 €')
    expect(disruptedOrder).toHaveTextContent('View incident')
    expect(disruptedOrder).not.toHaveTextContent('Download ticket')
    expect(disruptedOrder).not.toHaveTextContent('View products')
    expect(disruptedOrder).not.toHaveTextContent('Repeat order')
    expect(disruptedOrder).not.toHaveTextContent('Modify order')
  })

  it('should see the disrupted by edit order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.userUnreachable()],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    const disruptedOrder = screen.getByLabelText('disrupted-order-cell')

    expect(disruptedOrder).toHaveTextContent(
      'Delivery on Wednesday, 26 of February',
    )
    expect(disruptedOrder).toHaveTextContent('from 18:00 to 19:00')
    expect(disruptedOrder).toHaveTextContent('INCIDENT')
    expect(disruptedOrder).toHaveTextContent('Order 44051')
    expect(disruptedOrder).toHaveTextContent('Total 70,96 €')
    expect(disruptedOrder).toHaveTextContent('View incident')
    expect(disruptedOrder).not.toHaveTextContent('Download ticket')
    expect(disruptedOrder).not.toHaveTextContent('View products')
    expect(disruptedOrder).not.toHaveTextContent('Repeat order')
    expect(disruptedOrder).not.toHaveTextContent('Modify order')
  })

  it('should see the disrupted payment order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.paymentFailed()],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    const disruptedOrder = screen.getByLabelText(
      'with-payment-issue-order-cell',
    )

    expect(disruptedOrder).toHaveTextContent(
      'Delivery on Wednesday, 26 of February',
    )
    expect(disruptedOrder).toHaveTextContent('from 18:00 to 19:00')
    expect(disruptedOrder).toHaveTextContent('INCIDENT')
    expect(disruptedOrder).toHaveTextContent('Order 44051')
    expect(disruptedOrder).toHaveTextContent('Total 70,96 €')
    expect(disruptedOrder).toHaveTextContent('View incident')
    expect(disruptedOrder).not.toHaveTextContent('Download ticket')
    expect(disruptedOrder).not.toHaveTextContent('View products')
    expect(disruptedOrder).not.toHaveTextContent('Repeat order')
    expect(disruptedOrder).not.toHaveTextContent('Modify order')
  })

  it('should see the disrupted reprepared payment pending order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.repreparedPaymentPending()],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    const disruptedOrder = screen.getByLabelText('disrupted-order-cell')

    expect(disruptedOrder).toHaveTextContent(
      'Delivery on Wednesday, 26 of February',
    )
    expect(disruptedOrder).toHaveTextContent('from 18:00 to 19:00')
    expect(disruptedOrder).toHaveTextContent('INCIDENT')
    expect(disruptedOrder).toHaveTextContent('Order 44051')
    expect(disruptedOrder).toHaveTextContent('Total 70,96 €')
    expect(disruptedOrder).toHaveTextContent('View incident')
    expect(disruptedOrder).not.toHaveTextContent('Download ticket')
    expect(disruptedOrder).not.toHaveTextContent('View products')
    expect(disruptedOrder).not.toHaveTextContent('Repeat order')
    expect(disruptedOrder).not.toHaveTextContent('Modify order')
  })

  it('should allow to repeat an order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: { results: [OrderMother.delivered()] },
        },
        {
          path: '/customers/1/orders/44051/repeat/',
          responseBody: { results: repeatOrderLines },
        },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '10000000-1000-4000-8000-100000000000',
            lines: [
              { quantity: 2, product_id: '8731', sources: ['+RO', '+RO'] },
              {
                quantity: 3,
                product_id: '28491',
                sources: ['+RO', '+RO', '+RO'],
              },
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByLabelText('delivered-order-cell')
    repeatOrder()
    confirmRepeatOrder()
    await screen.findByLabelText('Show cart')

    expect(screen.getByText('Check cart')).toBeInTheDocument()
    expect(
      within(screen.getByLabelText('Show cart')).getByText('5'),
    ).toBeInTheDocument()
    expect(
      within(screen.getByLabelText('Show cart')).getByText('10,70 €'),
    ).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'repeat_purchase_click',
      {
        is_cart_empty: true,
        purchase_id: 44051,
        source: 'my_purchases_view',
      },
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'repeat_purchase_completed',
      {
        new_cart_id: '10000000-1000-4000-8000-100000000000',
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        order_id: 44051,
      },
    )
  })

  it('should allow to cancel the repeat order modal', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.delivered()],
          },
        },
        {
          path: '/customers/1/orders/44051/repeat/',
          responseBody: { results: repeatOrderLines },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByLabelText('delivered-order-cell')
    repeatOrder()
    cancelRepeatOrder()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should allow to see the ticket of an order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.delivered()],
          },
        },
        { path: '/customers/1/orders/44051/receipt/' },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    downloadTicket()
    await screen.findByText('Download ticket')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'ticket_download_click',
      {
        source: 'my_purchases_view',
      },
    )
    expect('/customers/1/orders/44051/receipt/').toHaveBeenFetched()
  })

  it('should allow to edit the products of the order', async () => {
    wrap(App)
      .atPath('/user-area/orders')
      .withNetwork([
        {
          path: '/customers/1/orders/',
          responseBody: {
            results: [OrderMother.confirmed()],
          },
        },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/customers/1/orders/44051/', responseBody: order },
        {
          path: '/customers/1/orders/44051/cart/',
          responseBody: orderCart,
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin()
      .mount()

    await screen.findByText('My orders', { selector: 'h1' })
    goToEditOrder()
    await screen.findByText('Modify order')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'edit_purchase_products_click',
      {
        source: 'purchase',
        purchase_id: 44051,
      },
    )
  })
})
