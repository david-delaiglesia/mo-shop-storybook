import { screen, waitForElementToBeRemoved } from '@testing-library/react'

import {
  cancelDuplicateOrdersAlert,
  confirmCheckout,
  confirmDuplicateOrdersAlert,
  confirmSlot,
  selectFirstAvailableDay,
  selectSlot,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { address } from 'app/address/__scenarios__/address'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { mockDate } from 'app/delivery-area/__scenarios__/slots'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'
import { DateTime } from 'utils/slots'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Duplicated orders alert', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  afterAll(() => {
    resetMockDate()
  })

  const { slots, resetMockDate } = mockDate()
  const firstAvailableSlot = slots.results.find((slot) => slot.available)
  const firstAvailableSlotHour = DateTime.getFormattedTime(
    firstAvailableSlot.start,
    'Europe/Madrid',
  )

  it('should inform about an order already confirmed for the same slot and address', async () => {
    const responses = [
      {
        path: '/customers/1/checkouts/5/',
        multipleResponses: [
          {
            responseBody: CheckoutMother.withoutSlot(),
          },
          {
            responseBody: {
              ...CheckoutMother.withoutSlot(),
              slot: firstAvailableSlot,
            },
          },
          {
            responseBody: {
              ...CheckoutMother.confirmed(),
              slot: firstAvailableSlot,
            },
          },
        ],
      },
      {
        path: '/customers/1/orders/',
        responseBody: {
          results: [{ ...CheckoutMother.filled(), slot: firstAvailableSlot }],
        },
      },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        responseBody: slots,
      },
      {
        path: '/customers/1/checkouts/5/delivery-info/',
        requestBody: {
          address: address,
          slot: firstAvailableSlot,
        },
        method: 'put',
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
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
    ]

    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    await screen.findByText('Delivery')
    selectFirstAvailableDay()
    selectSlot(new RegExp(firstAvailableSlotHour))
    confirmSlot()
    await waitForElementToBeRemoved(() =>
      screen.getByText('Pick a day for 46010'),
    )
    confirmCheckout()
    const duplicatedOrderDialog = await screen.findByRole('dialog')

    expect(duplicatedOrderDialog).toHaveTextContent(
      'You are about place 2 orders for the same day and address',
    )
    expect(duplicatedOrderDialog).toHaveTextContent(
      'Please confirm you want to receive multiple orders on the same address and same day',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'duplicated_orders_alert_view',
    )
  })

  it('should allow to cancel the alert and not continue with the checkout', async () => {
    const responses = [
      {
        path: '/customers/1/checkouts/5/',
        multipleResponses: [
          {
            responseBody: CheckoutMother.withoutSlot(),
          },
          {
            responseBody: {
              ...CheckoutMother.withoutSlot(),
              slot: firstAvailableSlot,
            },
          },
          {
            responseBody: {
              ...CheckoutMother.confirmed(),
              slot: firstAvailableSlot,
            },
          },
        ],
      },
      {
        path: '/customers/1/orders/',
        responseBody: {
          results: [{ ...CheckoutMother.filled(), slot: firstAvailableSlot }],
        },
      },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        responseBody: slots,
      },
      {
        path: '/customers/1/checkouts/5/delivery-info/',
        requestBody: {
          address: address,
          slot: firstAvailableSlot,
        },
        method: 'put',
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
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
    ]

    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    await screen.findByText('Delivery')
    selectFirstAvailableDay()
    selectSlot(new RegExp(firstAvailableSlotHour))
    confirmSlot()
    await waitForElementToBeRemoved(() =>
      screen.getByText('Pick a day for 46010'),
    )
    confirmCheckout()
    const duplicatedOrderDialog = await screen.findByRole('dialog')
    cancelDuplicateOrdersAlert()

    expect(duplicatedOrderDialog).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'duplicated_orders_click',
      { result: 'cancel' },
    )
  })

  it('should allow to continue with the checkout', async () => {
    const responses = [
      {
        path: '/customers/1/checkouts/5/',
        multipleResponses: [
          {
            responseBody: CheckoutMother.withoutSlot(),
          },
          {
            responseBody: {
              ...CheckoutMother.withoutSlot(),
              slot: firstAvailableSlot,
            },
          },
          {
            responseBody: {
              ...CheckoutMother.confirmed(),
              slot: firstAvailableSlot,
            },
          },
        ],
      },
      {
        path: '/customers/1/orders/',
        responseBody: {
          results: [{ ...CheckoutMother.filled(), slot: firstAvailableSlot }],
        },
      },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        responseBody: slots,
      },
      {
        path: '/customers/1/checkouts/5/delivery-info/',
        requestBody: {
          address: address,
          slot: firstAvailableSlot,
        },
        method: 'put',
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
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
    ]

    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')
    selectFirstAvailableDay()
    selectSlot(new RegExp(firstAvailableSlotHour))
    confirmSlot()
    await waitForElementToBeRemoved(() =>
      screen.getByText('Pick a day for 46010'),
    )
    confirmCheckout()
    await screen.findByRole('dialog')
    confirmDuplicateOrdersAlert()

    await screen.findByRole('region', {
      name: 'Order 44051 confirmed',
    })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'duplicated_orders_click',
      { result: 'continue' },
    )
  })
})
