import { screen } from '@testing-library/react'

import { confirmCheckout } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Metrics', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should send an order_confirmed event when an authenticated checkout is completed', async () => {
    const responses = [
      {
        path: '/customers/1/checkouts/5/',
        multipleResponses: [
          { responseBody: CheckoutMother.filled() },
          { responseBody: CheckoutMother.confirmed() },
        ],
      },
      {
        path: '/customers/1/checkouts/5/orders/',
        method: 'post',
        responseBody: CheckoutMother.confirmed(),
      },
      {
        path: '/customers/1/orders/44051/',
        responseBody: OrderMother.confirmed(),
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [],
        },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    await screen.findByText('Delivery')
    confirmCheckout()

    await screen.findByRole('region', {
      name: 'Order 44051 confirmed',
    })
  })
})
