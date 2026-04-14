import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'

import {
  cancelOrder,
  closeCancelOrderAlert,
  confirmCancelOrderAlert,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Order Detail', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should display the cancel order alert', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: OrderMother.confirmed(),
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    cancelOrder()

    const alert = screen.getByRole('dialog')
    expect(within(alert).getByText('Cancel order?')).toBeInTheDocument()
    expect(
      within(alert).getByText(
        'If you continue, you will lose the reserved date and delivery time slot.',
      ),
    ).toBeInTheDocument()
    expect(
      within(alert).getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument()
    expect(
      within(alert).getByRole('button', { name: 'Yes, cancel order' }),
    ).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'cancel_purchase_click',
      { purchase_id: 44051 },
    )
  })

  it('should close the cancel order alert', async () => {
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: OrderMother.confirmed(),
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLines,
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    cancelOrder()
    const alert = screen.getByRole('dialog')
    closeCancelOrderAlert()

    expect(alert).not.toBeInTheDocument()
  })

  it('should be able to cancel the order', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          multipleResponses: [
            {
              responseBody: OrderMother.confirmed(),
            },
            {
              responseBody: OrderMother.cancelledByUser(),
            },
          ],
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: `/customers/1/orders/44051/`,
          method: 'delete',
          responseBody: OrderMother.confirmed(),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    const cancelButton = screen.getByText('Cancel order')
    cancelOrder()
    confirmCancelOrderAlert()
    await waitForElementToBeRemoved(() => screen.getByText('Cancel order'))

    expect(cancelButton).not.toBeInTheDocument()
    expect(screen.getByText('Cancelled')).toBeInTheDocument()
    expect(
      screen.getByText(
        'You have cancelled this order. Remember that you can "repeat order" and buy the same products again.',
      ),
    ).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'cancel_purchase_confirmation_click',
      {
        purchase_id: 44051,
      },
    )
  })
})
