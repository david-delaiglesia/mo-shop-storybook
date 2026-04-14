import { screen, within } from '@testing-library/react'

import {
  confirmSlot,
  selectFirstAvailableDay,
  selectFirstSlot,
} from '../../checkout/__tests__/helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { AddressNotInWarehouseException } from 'app/address'
import { AddressMother } from 'app/address/__scenarios__/AddressMother'
import { SlotsMother } from 'app/delivery-area/__scenarios__/SlotsMother'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { clickToModifyDelivery } from 'pages/__tests__/helpers/checkout'
import {
  confirmAddressChange,
  openChangeAddressSelector,
  selectAddress,
} from 'pages/user-area/__tests__/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

vi.mock(import('services/http'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    NetworkError: {
      ...originalModule.NetworkError,
      publish: vi.fn(),
    },
  }
})

describe('Order detail - Address not in warehouse', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  it('should show AddressNotInWarehouseModal when delivery-info fails with address_not_in_warehouse', async () => {
    const slots = SlotsMother.withAvailableSlots()
    const selectedSlot = slots.results[0]

    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.confirmed(),
        },
        {
          path: '/customers/1/orders/44051/lines/prepared/',
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slots,
        },
        {
          path: '/customers/1/orders/44051/delivery-info/',
          method: 'put',
          status: 400,
          requestBody: {
            address: AddressMother.arquitectoMora(),
            slot: selectedSlot,
          },
          responseBody: {
            errors: [AddressNotInWarehouseException.toJSON()],
          },
        },
      ])
      .withLogin()
      .mount()

    await clickToModifyDelivery()
    await screen.findByText(/Pick a day for/)
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()

    const dialog = await screen.findByRole('dialog', {
      name: 'It is not possible to change to the selected address',
    })
    await within(dialog).findByText(
      'To change the address, cancel this order, change the address and start a new order.',
    )
    const dialogButton = await within(dialog).findByRole('button', {
      name: 'OK',
    })

    userEvent.click(dialogButton)

    await screen.findByText(/Pick a day for/)
  })

  it('should send addressNotChangedError metric when delivery-info fails with address_not_in_warehouse', async () => {
    const slots = SlotsMother.withAvailableSlots()
    const selectedSlot = slots.results[0]

    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.confirmed(),
        },
        {
          path: '/customers/1/orders/44051/lines/prepared/',
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slots,
        },
        {
          path: '/customers/1/orders/44051/delivery-info/',
          method: 'put',
          status: 400,
          requestBody: {
            address: AddressMother.arquitectoMora(),
            slot: selectedSlot,
          },
          responseBody: {
            errors: [AddressNotInWarehouseException.toJSON()],
          },
        },
      ])
      .withLogin()
      .mount()

    await clickToModifyDelivery()
    await screen.findByText(/Pick a day for/)
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()

    await screen.findByText(/Pick a day for/)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_not_changed_error',
      {
        order_id: OrderMother.DEFAULT_ORDER_ID,
        current_address_id: 1,
        new_address_id: 1,
      },
    )
  })

  it('should reset selected address when delivery-info fails with address_not_in_warehouse', async () => {
    const originalAddress = AddressMother.arquitectoMora()
    const secondAddress = {
      id: 2,
      address: 'Calle Test, 5',
      address_detail: '',
      postal_code: '28001',
      latitude: '40.41650',
      longitude: '-3.70379',
      comments: '',
      permanent_address: true,
      entered_manually: false,
      town: 'Madrid',
    }
    const originalSlots = SlotsMother.withAvailableSlots()
    const secondAddressSlots = SlotsMother.withAvailableSlots()
    const selectedSlot = secondAddressSlots.results[0]

    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.confirmed(),
        },
        {
          path: '/customers/1/orders/44051/lines/prepared/',
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [originalAddress, secondAddress] },
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: originalSlots,
        },
        {
          path: '/customers/1/addresses/2/slots/',
          responseBody: secondAddressSlots,
        },
        {
          path: '/customers/1/orders/44051/delivery-info/',
          method: 'put',
          status: 400,
          requestBody: {
            address: secondAddress,
            slot: selectedSlot,
          },
          responseBody: {
            errors: [AddressNotInWarehouseException.toJSON()],
          },
        },
      ])
      .withLogin()
      .mount()

    await clickToModifyDelivery()
    await screen.findByText(/Pick a day for 46010/)
    openChangeAddressSelector()
    await screen.findByText('Delivery address for this order')
    selectAddress(secondAddress.address)
    confirmAddressChange()
    await screen.findByText(/Pick a day for 28001/)
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()

    expect(await screen.findByText(/Pick a day for 46010/)).toBeInTheDocument()
  })
})
