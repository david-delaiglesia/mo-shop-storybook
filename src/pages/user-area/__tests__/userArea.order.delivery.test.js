import { screen, within } from '@testing-library/react'

import {
  confirmAddressChange,
  confirmSlot,
  openChangeAddressSelector,
  selectAddress,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  address,
  addressFromDifferentWarehouse,
  secondaryAddress,
} from 'app/address/__scenarios__/address'
import { mockDate } from 'app/delivery-area/__scenarios__/slots'
import { order, preparedLines } from 'app/order/__scenarios__/orderDetail'
import { clickToModifyDelivery } from 'pages/__tests__/helpers/checkout'
import { Storage } from 'services/storage'

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

  it('should maintain the selected slot when the user changes address to the same address', async () => {
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
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/addresses/`,
        responseBody: {
          results: [address, secondaryAddress],
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

    const deliverySection = await screen.findByRole('region', {
      name: 'Delivery',
    })
    await clickToModifyDelivery()
    await screen.findByText(`Pick a day for ${address.postal_code}`)
    openChangeAddressSelector()
    await screen.findByText('Delivery address for this order')
    confirmAddressChange()
    await screen.findByText(`Pick a day for ${address.postal_code}`)

    const saveButton = within(deliverySection).getByRole('button', {
      name: 'Save',
    })
    expect(saveButton).toBeEnabled()

    confirmSlot()
    await screen.findByRole('region', {
      name: 'Delivery',
    })

    expect(deliverySection).toHaveTextContent(
      'Saturday 2 of January from 11:00 to 12:00',
    )
  })

  it('should clear the day and slot selection when the user changes address', async () => {
    const [initialSlot] = slots.results
    const newSlot = slots.results.find(
      (slot) => slot.start === '2021-01-03T12:00:00Z',
    )
    const responses = [
      {
        path: `/customers/1/orders/${order.id}/`,
        responseBody: {
          ...order,
          address,
          slot: initialSlot,
          start_date: initialSlot.start,
        },
      },
      {
        path: `/customers/1/orders/${order.id}/lines/prepared/`,
        responseBody: preparedLines,
      },
      {
        path: `/customers/1/addresses/`,
        responseBody: {
          results: [address, addressFromDifferentWarehouse],
        },
      },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        responseBody: slots,
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/slots/`,
        responseBody: slots,
      },
      {
        path: `/customers/1/orders/${order.id}/delivery-info/`,
        requestBody: { address: addressFromDifferentWarehouse, slot: newSlot },
        method: 'put',
      },
    ]
    wrap(App)
      .atPath(`/user-area/orders/${order.id}`)
      .withNetwork(responses)
      .withLogin()
      .mount()

    await clickToModifyDelivery()
    await screen.findByText(`Pick a day for ${address.postal_code}`)

    expect(screen.getByText('Slots for Saturday 2')).toBeInTheDocument()

    openChangeAddressSelector()
    await screen.findByText('Delivery address for this order')
    selectAddress(addressFromDifferentWarehouse.address)
    confirmAddressChange()
    await screen.findByLabelText(
      `Pick a day for ${addressFromDifferentWarehouse.postal_code}`,
    )

    expect(screen.queryByText(/Slots for/)).not.toBeInTheDocument()
  })
})
