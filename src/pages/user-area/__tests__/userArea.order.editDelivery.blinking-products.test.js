import { screen, within } from '@testing-library/react'

import {
  closeOrderUpdatedDialog,
  confirmSlot,
  continueWithoutBlinkingProduct,
  selectDeliveryDate,
  selectDifferentDayBlinkingProduct,
  selectSlot,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { address } from 'app/address/__scenarios__/address'
import { mockDate } from 'app/delivery-area/__scenarios__/slots'
import {
  order,
  preparedLines,
  preparedLinesWithBlinkingProduct,
  preparedLinesWithSaturdayBlinkingProduct,
  preparedLinesWithUnavailableFromBlinkingProduct,
} from 'app/order/__scenarios__/orderDetail'
import { clickToModifyDelivery } from 'pages/__tests__/helpers/checkout'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Order - Edit Delivery ', () => {
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

  it('should see the modal when select a day that match with a blinking product', async () => {
    const [, selectedSlot] = slots.results
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
        responseBody: preparedLinesWithSaturdayBlinkingProduct,
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
    selectDeliveryDate('Saturday, 2')
    const modal = screen.getByRole('dialog')
    const monday = within(modal).getByText('M').parentNode
    const tuesday = within(modal).getByText('TU').parentNode
    const wednesday = within(modal).getByText('W').parentNode
    const thursday = within(modal).getByText('T').parentNode
    const friday = within(modal).getByText('F').parentNode
    const saturday = within(modal).getByText('S').parentNode

    expect(modal).toHaveTextContent(
      'These products will not be available on the selected day',
    )
    expect(modal).toHaveTextContent(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(modal).toHaveTextContent(`Not available on Saturday`)
    expect(modal).toContainElement(
      screen.getByRole('button', { name: 'Continue without the products' }),
    )
    expect(modal).toContainElement(
      screen.getByRole('button', { name: 'Select a different day' }),
    )
    expect(within(modal).getByRole('img')).toBeInTheDocument()
    expect(monday).toHaveClass('blinking-product__weekday--available')
    expect(tuesday).toHaveClass('blinking-product__weekday--available')
    expect(wednesday).toHaveClass('blinking-product__weekday--available')
    expect(thursday).toHaveClass('blinking-product__weekday--available')
    expect(friday).toHaveClass('blinking-product__weekday--available')
    expect(saturday).toHaveClass('blinking-product__weekday--unavailable')
  }, 10000)

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

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: 'Saturday, 2',
        pressed: true,
      }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', {
        name: 'Sunday, 3',
        pressed: true,
      }),
    ).not.toBeInTheDocument()
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

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect('/customers/1/orders/44051/lines/prepared/').toHaveBeenFetchedTimes(
      3,
    )
  })

  it("shouldn't see the alert again if edit slot after confirm remove products and new slot", async () => {
    const [selectedSlot] = slots.results
    const responses = [
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
        multipleResponses: [
          { responseBody: preparedLinesWithBlinkingProduct },
          { responseBody: preparedLinesWithBlinkingProduct },
          { responseBody: preparedLines },
        ],
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
        requestBody: {
          address,
          slot: {
            id: '11',
            start: '2021-01-03T10:00:00Z', // Sunday
            end: '2021-01-03T11:00:00Z',
            price: '6.00',
            available: true,
            open: true,
          },
        },
        method: 'put',
      },
      {
        path: '/customers/1/orders/44051/remove-lines/',
        method: 'post',
        requestBody: {
          product_ids: ['8731'],
        },
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('70,96 €')
    await clickToModifyDelivery()
    await screen.findByText(`Pick a day for ${address.postal_code}`)
    selectDeliveryDate('Sunday, 3')
    continueWithoutBlinkingProduct()
    await screen.findByText('55,55 €')
    selectSlot('From 12:00 to 13:00')
    confirmSlot()

    const orderUpdatedModal = await screen.findByRole('dialog')
    expect(
      within(orderUpdatedModal).getByText('Order updated'),
    ).toBeInTheDocument()

    closeOrderUpdatedDialog()

    await clickToModifyDelivery()
    await screen.findByText(`Pick a day for ${address.postal_code}`)

    expect(
      screen.queryByRole('dialog', { label: 'Availability notice' }),
    ).not.toBeInTheDocument()
  })

  it('should display information about product unavailable from a specific day when selecting the same day', async () => {
    const [selectedSlot] = slots.results
    const unavailabilityDate = '2021-01-03T10:47:25Z'
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
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody:
          preparedLinesWithUnavailableFromBlinkingProduct(unavailabilityDate),
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
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('70,96 €')
    await clickToModifyDelivery()
    await screen.findByText(`Pick a day for ${address.postal_code}`)
    selectDeliveryDate('Sunday, 3')
    const modal = screen.getByRole('dialog')

    expect(modal).toHaveTextContent(`Not available from January 3`)
  })

  it('should display information about product unavailable from a specific day when selecting a day after', async () => {
    const [selectedSlot] = slots.results
    const unavailabilityDate = '2021-01-02T10:47:25Z'
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
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody:
          preparedLinesWithUnavailableFromBlinkingProduct(unavailabilityDate),
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
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('70,96 €')
    await clickToModifyDelivery()
    await screen.findByText(`Pick a day for ${address.postal_code}`)
    selectDeliveryDate('Sunday, 3')
    const modal = screen.getByRole('dialog')

    expect(modal).toHaveTextContent(`Not available from January 2`)
  })

  it('should see the modal when select a day that match with a blinking product and unavailable_from FF is active', async () => {
    const [, selectedSlot] = slots.results
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
        responseBody: preparedLinesWithSaturdayBlinkingProduct,
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
    selectDeliveryDate('Saturday, 2')
    const modal = screen.getByRole('dialog')
    const monday = within(modal).getByText('M').parentNode
    const tuesday = within(modal).getByText('TU').parentNode
    const wednesday = within(modal).getByText('W').parentNode
    const thursday = within(modal).getByText('T').parentNode
    const friday = within(modal).getByText('F').parentNode
    const saturday = within(modal).getByText('S').parentNode

    expect(modal).toHaveTextContent(
      'These products will not be available on the selected day',
    )
    expect(modal).toHaveTextContent(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(modal).toHaveTextContent(`Not available on Saturday`)
    expect(modal).toContainElement(
      screen.getByRole('button', { name: 'Continue without the products' }),
    )
    expect(modal).toContainElement(
      screen.getByRole('button', { name: 'Select a different day' }),
    )
    expect(within(modal).getByRole('img')).toBeInTheDocument()
    expect(monday).toHaveClass('blinking-product__weekday--available')
    expect(tuesday).toHaveClass('blinking-product__weekday--available')
    expect(wednesday).toHaveClass('blinking-product__weekday--available')
    expect(thursday).toHaveClass('blinking-product__weekday--available')
    expect(friday).toHaveClass('blinking-product__weekday--available')
    expect(saturday).toHaveClass('blinking-product__weekday--unavailable')
  })

  it('should not display information about product unavailable from yesterday when selecting a day', async () => {
    const [selectedSlot] = slots.results
    const unavailabilityDate = '2020-12-31T10:47:25Z'
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
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody:
          preparedLinesWithUnavailableFromBlinkingProduct(unavailabilityDate),
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
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('70,96 €')
    await clickToModifyDelivery()
    await screen.findByText(`Pick a day for ${address.postal_code}`)
    selectDeliveryDate('Sunday, 3')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('should not display information about product without valid unavailability when selecting a day', async () => {
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
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody: preparedLines,
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
    ]
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('70,96 €')
    await clickToModifyDelivery()
    await screen.findByText(`Pick a day for ${address.postal_code}`)
    selectDeliveryDate('Sunday, 3')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
