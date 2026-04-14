import { screen, within } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { HomeSectionMother } from 'app/home/__scenarios__/HomeSectionMother'
import { HomeSectionsBuilder } from 'app/home/__scenarios__/HomeSectionsBuilder'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { clickToResolveOrderPaymentPendingIssue } from 'pages/__tests__/helpers/payment'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

describe('Payment Incidence Order Widget', () => {
  it('should show the payment issue order widget section', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: new HomeSectionsBuilder().withSection(
            HomeSectionMother.widgetOrders([
              OrderMother.repreparedPaymentPending(),
            ]),
          ),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Próxima entrega')

    const widget = screen.getByRole('listitem', {
      name: 'Order 44051, Pending payment Select a payment method to resolve the issue.',
    })

    const widgetTitle = within(widget).getByText('Order 44051', {
      selector: 'h3',
    })

    const widgetStatus = within(widget).getByText('Pending payment')
    const widgetImage = within(widget).getByRole('img')
    const widgetDescription = within(widget).getByText(
      'Select a payment method to resolve the issue.',
    )
    const widgetAction = within(widget).getByRole('button', {
      name: 'Solve incident',
    })

    expect(widget).toBeInTheDocument()
    expect(widgetTitle).toBeInTheDocument()
    expect(widgetStatus).toBeInTheDocument()
    expect(widgetImage).toHaveAttribute(
      'src',
      expect.stringContaining('order-disrupted.svg'),
    )
    expect(widgetDescription).toBeInTheDocument()
    expect(widgetAction).toBeInTheDocument()
  })

  it('should fix the order on action button click', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: new HomeSectionsBuilder().withSection(
            HomeSectionMother.widgetOrders([
              OrderMother.repreparedPaymentPending(),
            ]),
          ),
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.repreparedPaymentPending(),
        },
        {
          path: '/customers/1/orders/44051/lines/prepared/',
          responseBody: preparedLines,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Próxima entrega')
    clickToResolveOrderPaymentPendingIssue()

    const orderTitle = await screen.findByText('Order 44051')
    expect(orderTitle).toBeInTheDocument()
  })

  it('should track metrics on fix the order when has payment issues', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: new HomeSectionsBuilder().withSection(
            HomeSectionMother.widgetOrders([
              OrderMother.repreparedPaymentPending(),
            ]),
          ),
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.repreparedPaymentPending(),
        },
        {
          path: '/customers/1/orders/44051/lines/prepared/',
          responseBody: preparedLines,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Próxima entrega')
    clickToResolveOrderPaymentPendingIssue()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'solve_payment_issue_click',
      {
        order_id: 44051,
        status: 'reprepared-payment-issue',
      },
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('widget_click', {
      id: 44051,
      slot_date: {
        start: '2020-02-26T17:00:00Z',
        end: '2020-02-26T18:00:00Z',
      },
      status: 'reprepared-payment-issue',
      action: 'fix',
    })
  })
})
