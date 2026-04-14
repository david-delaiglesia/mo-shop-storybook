import { screen } from '@testing-library/react'

import MockDate from 'mockdate'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithPaymentIssueWidget } from 'app/catalog/__scenarios__/home'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import {
  disruptedPaymentOrder,
  preparedLines,
} from 'app/order/__scenarios__/orderDetail'
import { clickToResolvePaymentIncidentWidget } from 'pages/__tests__/helpers/payment'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

describe('Payment Incidence Order Widget', () => {
  beforeEach(() => {
    MockDate.set(new Date('2020-08-25T19:00:00Z'))
  })

  it('should show the payment issue order widget section', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithPaymentIssueWidget,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')

    expect(screen.getByText('Order 1006')).toBeInTheDocument()
    expect(screen.getByText('Payment has failed')).toBeInTheDocument()
    expect(screen.getByText('Solve incident')).toBeInTheDocument()
  })

  it('should fix the order when has payment issues', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithPaymentIssueWidget,
      },
      {
        path: '/customers/1/orders/1006/',
        responseBody: { ...OrderMother.paymentFailed(), id: 1006 },
      },
      {
        path: '/customers/1/orders/1006/lines/prepared/',
        responseBody: preparedLines,
      },
      {
        path: '/customers/1/payment-cards/',
        responseBody: { results: [] },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    clickToResolvePaymentIncidentWidget('1006')
    await screen.findByText('My orders')

    expect(screen.getByText('Payment has failed')).toBeInTheDocument()
  })

  it('should track metrics on fix the order when has payment issues', async () => {
    const responses = [
      {
        path: '/customers/1/home/',
        responseBody: homeWithPaymentIssueWidget,
      },
      {
        path: '/customers/1/orders/1006/',
        responseBody: { ...disruptedPaymentOrder, id: 1006 },
      },
      {
        path: '/customers/1/orders/1006/lines/prepared/',
        responseBody: preparedLines,
      },
      {
        path: '/customers/1/payment-cards/',
        responseBody: { results: [] },
      },
    ]

    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Próxima entrega')
    clickToResolvePaymentIncidentWidget('1006')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'solve_payment_issue_click',
      {
        order_id: 1006,
        status: 'payment-issue',
      },
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('widget_click', {
      id: 1006,
      slot_date: {
        start: '2020-08-25T19:00:00Z',
        end: '2020-08-25T20:00:00Z',
      },
      status: 'payment-issue',
      action: 'fix',
    })
  })
})
