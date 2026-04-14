import { screen, within } from '@testing-library/react'

import {
  confirmSlot,
  selectFirstAvailableDay,
  selectFirstSlot,
} from '../../checkout/__tests__/helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { AddressMother } from 'app/address/__scenarios__/AddressMother'
import { SlotNotBookedException, SlotTakenException } from 'app/checkout'
import { SlotsMother } from 'app/delivery-area/__scenarios__/SlotsMother'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import {
  clickToModifyDelivery,
  closeOrderSlotNotAvailableModal,
} from 'pages/__tests__/helpers/checkout'
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

describe('Order detail - Slot not available', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  it('should show SlotNotAvailableModal when delivery-info update fails with slot_not_booked', async () => {
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
            errors: [SlotNotBookedException.toJSON()],
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

    await screen.findByRole('dialog', {
      name: "It's not possible to switch to the selected slot",
    })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'slot_not_available_view',
      { user_flow: 'edit_order', order_id: OrderMother.DEFAULT_ORDER_ID },
    )
  })

  it('should show SlotNotAvailableModal when delivery-info update fails with slot_taken', async () => {
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
            errors: [SlotTakenException.toJSON()],
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

    expect(
      await screen.findByRole('dialog', {
        name: "It's not possible to switch to the selected slot",
      }),
    ).toBeInTheDocument()
  })

  it('should close SlotNotAvailableModal when clicking the action button', async () => {
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
            errors: [SlotNotBookedException.toJSON()],
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
      name: "It's not possible to switch to the selected slot",
    })

    await closeOrderSlotNotAvailableModal()

    expect(dialog).not.toBeInTheDocument()
  })

  it('should reset selected slot when SlotNotAvailableModal appears', async () => {
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
            errors: [SlotNotBookedException.toJSON()],
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

    await screen.findByRole('dialog', {
      name: "It's not possible to switch to the selected slot",
    })

    await closeOrderSlotNotAvailableModal()

    const deliverySection = screen.getByRole('region', { name: 'Delivery' })
    expect(
      await within(deliverySection).findByText(/Pick a day for/),
    ).toBeInTheDocument()
  })
})
