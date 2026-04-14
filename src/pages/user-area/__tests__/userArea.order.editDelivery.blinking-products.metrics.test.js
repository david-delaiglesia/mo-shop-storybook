import { screen } from '@testing-library/react'

import {
  continueWithoutBlinkingProduct,
  selectDeliveryDate,
  selectDifferentDayBlinkingProduct,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { address } from 'app/address/__scenarios__/address'
import { mockDate } from 'app/delivery-area/__scenarios__/slots'
import {
  order,
  preparedLinesWithBlinkingProduct,
} from 'app/order/__scenarios__/orderDetail'
import { clickToModifyDelivery } from 'pages/__tests__/helpers/checkout'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Order - Edit Delivery', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const { slots, resetMockDate } = mockDate()

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  afterAll(() => {
    resetMockDate()
  })

  it('should send metric when show the modal when select a day that match with a blinking product', async () => {
    const [selectedSlot] = slots.results
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: {
          ...order,
          address,
          slot: selectedSlot,
          start_date: selectedSlot.start,
        },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLinesWithBlinkingProduct,
      },
      {
        path: `/customers/1/addresses/`,
        responseBody: {
          results: [address],
        },
      },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        multipleResponses: [{ responseBody: slots }, { responseBody: slots }],
      },
      {
        path: `/customers/1/orders/${order.id}/delivery-info/`,
        requestBody: { address, slot: selectedSlot },
        method: 'put',
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await clickToModifyDelivery()
    await screen.findByText(`Pick a day for ${address.postal_code}`)
    selectDeliveryDate('Sunday, 3')

    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'unavailable_day_product_alert',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        merca: ['8731'],
        weekday: 'sun',
        cart_mode: 'edit',
        purchase_id: 44051,
      },
    )
  })

  it('should close the modal and select again the order day', async () => {
    const [selectedSlot] = slots.results
    const responses = [
      {
        path: `/customers/1/orders/44051/`,
        responseBody: {
          ...order,
          address,
          slot: selectedSlot,
          start_date: selectedSlot.start,
        },
      },
      {
        path: `/customers/1/orders/44051/lines/prepared/`,
        responseBody: preparedLinesWithBlinkingProduct,
      },
      {
        path: `/customers/1/addresses/`,
        responseBody: {
          results: [address],
        },
      },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        multipleResponses: [{ responseBody: slots }, { responseBody: slots }],
      },
      {
        path: `/customers/1/orders/${order.id}/delivery-info/`,
        requestBody: { address, slot: selectedSlot },
        method: 'put',
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await clickToModifyDelivery()
    await screen.findByText(`Pick a day for ${address.postal_code}`)
    selectDeliveryDate('Sunday, 3')
    selectDifferentDayBlinkingProduct()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'pick_other_day_unavailable_day_product_alert_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        merca: ['8731'],
        weekday: 'sun',
        cart_mode: 'edit',
        purchase_id: 44051,
      },
    )
  })

  it('should can confirm remove the blinking products and update the order', async () => {
    const [selectedSlot] = slots.results
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          multipleResponses: [
            {
              responseBody: {
                ...order,
                address,
                slot: selectedSlot,
                start_date: selectedSlot.start,
              },
            },
            {
              responseBody: {
                ...order,
                address,
                slot: selectedSlot,
                start_date: selectedSlot.start,
                summary: {
                  ...order.summary,
                  total: '55.55',
                },
              },
            },
          ],
        },
        {
          path: '/customers/1/orders/44051/lines/prepared/',
          responseBody: preparedLinesWithBlinkingProduct,
        },
        {
          path: `/customers/1/addresses/`,
          responseBody: {
            results: [address],
          },
        },
        {
          path: `/customers/1/addresses/${address.id}/slots/`,
          multipleResponses: [{ responseBody: slots }, { responseBody: slots }],
        },
        {
          path: `/customers/1/orders/${order.id}/delivery-info/`,
          requestBody: { address, slot: selectedSlot },
          method: 'put',
        },
        {
          path: '/customers/1/orders/44051/remove-lines/',
          method: 'post',
          requestBody: {
            product_ids: ['8731'],
          },
          responseBody: {
            ...order,
            address,
            slot: selectedSlot,
            start_date: selectedSlot.start,
            summary: {
              ...order.summary,
              total: '55.55',
            },
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('70,96 €')
    await clickToModifyDelivery()
    await screen.findByText(`Pick a day for ${address.postal_code}`)
    selectDeliveryDate('Sunday, 3')
    continueWithoutBlinkingProduct()
    await screen.findByText('55,55 €')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'continue_unavailable_day_product_alert_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        merca: ['8731'],
        weekday: 'sun',
        cart_mode: 'edit',
        purchase_id: 44051,
      },
    )
  })
})
