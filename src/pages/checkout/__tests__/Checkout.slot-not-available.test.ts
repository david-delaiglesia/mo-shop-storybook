import { screen, waitFor, within } from '@testing-library/react'

import {
  confirmSlot,
  selectFirstAvailableDay,
  selectFirstSlot,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { AddressMother } from 'app/address/__scenarios__/AddressMother'
import { SlotNotBookedException, SlotTakenException } from 'app/checkout'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { SlotsMother } from 'app/delivery-area/__scenarios__/SlotsMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import {
  closeCheckoutSlotNotAvailableModal,
  confirmCheckout,
} from 'pages/__tests__/helpers/checkout'
import { knownFeatureFlags } from 'services/feature-flags'
import { NetworkError } from 'services/http'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')

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
vi.unmock('app/i18n/client')

describe('Checkout - Slot not available', () => {
  configure({
    changeRoute: history.push,
  })

  beforeEach(() => {
    activeFeatureFlags([
      knownFeatureFlags.CHECKOUT_NEW_CONFIRM_STRATEGY,
      knownFeatureFlags.CHECKOUT_SLOT_NOT_AVAILABLE,
    ])
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  it('should show slot not available modal when confirm fails with slot_not_booked', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/checkouts/5/confirm/',
          method: 'post',
          status: 400,
          responseBody: {
            errors: [SlotNotBookedException.toJSON()],
          },
        },
      ])
      .withLogin()
      .mount()

    await confirmCheckout()

    expect(
      await screen.findByRole('dialog', {
        name: 'The selected delivery slot is no longer available',
      }),
    ).toBeInTheDocument()
  })

  it('should show slot not available modal when confirm fails with slot_taken', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/checkouts/5/confirm/',
          method: 'post',
          status: 400,
          responseBody: {
            errors: [SlotTakenException.toJSON()],
          },
        },
      ])
      .withLogin()
      .mount()

    await confirmCheckout()

    expect(
      await screen.findByRole('dialog', {
        name: 'The selected delivery slot is no longer available',
      }),
    ).toBeInTheDocument()
  })

  it('should close modal when CTA is clicked', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/checkouts/5/confirm/',
          method: 'post',
          status: 400,
          responseBody: {
            errors: [SlotNotBookedException.toJSON()],
          },
        },
      ])
      .withLogin()
      .mount()

    await confirmCheckout()

    const dialog = await screen.findByRole('dialog', {
      name: 'The selected delivery slot is no longer available',
    })

    await closeCheckoutSlotNotAvailableModal()

    expect(dialog).not.toBeInTheDocument()
  })

  it('should send slot_not_available_view metric with checkout_id when slot not available modal is shown', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/checkouts/5/confirm/',
          method: 'post',
          status: 400,
          responseBody: {
            errors: [SlotNotBookedException.toJSON()],
          },
        },
      ])
      .withLogin()
      .mount()

    await confirmCheckout()

    await screen.findByRole('dialog', {
      name: 'The selected delivery slot is no longer available',
    })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'slot_not_available_view',
      { user_flow: 'checkout', checkout_id: 5 },
    )
  })

  it('should show slot picker when clicking Choose a new slot in slot not available modal', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/checkouts/5/confirm/',
          method: 'post',
          status: 400,
          responseBody: {
            errors: [SlotNotBookedException.toJSON()],
          },
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [AddressMother.arquitectoMora()] },
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: SlotsMother.withAvailableSlots(),
        },
      ])
      .withLogin()
      .mount()

    await confirmCheckout()
    await closeCheckoutSlotNotAvailableModal()

    const deliverySection = screen.getByRole('region', { name: 'Delivery' })
    expect(
      await within(deliverySection).findByText('Pick a day for 46010'),
    ).toBeInTheDocument()
  })

  it('should show slot not available modal when delivery-info update fails with slot_not_booked', async () => {
    const slots = SlotsMother.withAvailableSlots()
    const selectedSlot = slots.results[0]

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutSlot(),
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [AddressMother.arquitectoMora()] },
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slots,
        },
        {
          path: '/customers/1/checkouts/5/delivery-info/',
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

    await screen.findByText(/Pick a day for/)
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()

    expect(
      await screen.findByRole('dialog', {
        name: 'The selected delivery slot is no longer available',
      }),
    ).toBeInTheDocument()
  })

  it('should show slot picker when clicking Choose a new slot in slot not available modal after delivery-info update fails', async () => {
    const slots = SlotsMother.withAvailableSlots()
    const selectedSlot = slots.results[0]

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutSlot(),
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [AddressMother.arquitectoMora()] },
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slots,
        },
        {
          path: '/customers/1/checkouts/5/delivery-info/',
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

    await screen.findByText(/Pick a day for/)
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()

    await screen.findByRole('dialog', {
      name: 'The selected delivery slot is no longer available',
    })

    await closeCheckoutSlotNotAvailableModal()

    const deliverySection = screen.getByRole('region', { name: 'Delivery' })
    expect(
      await within(deliverySection).findByText('Pick a day for 46010'),
    ).toBeInTheDocument()
  })

  it('should show slot not available modal when delivery-info update fails with slot_taken', async () => {
    const slots = SlotsMother.withAvailableSlots()
    const selectedSlot = slots.results[0]

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutSlot(),
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [AddressMother.arquitectoMora()] },
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slots,
        },
        {
          path: '/customers/1/checkouts/5/delivery-info/',
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

    await screen.findByText(/Pick a day for/)
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()

    expect(
      await screen.findByRole('dialog', {
        name: 'The selected delivery slot is no longer available',
      }),
    ).toBeInTheDocument()
  })

  it('should NOT show slot not available modal when delivery-info update fails with slot_not_booked (flag OFF)', async () => {
    activeFeatureFlags([knownFeatureFlags.CHECKOUT_NEW_CONFIRM_STRATEGY])

    const slots = SlotsMother.withAvailableSlots()
    const selectedSlot = slots.results[0]

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutSlot(),
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [AddressMother.arquitectoMora()] },
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slots,
        },
        {
          path: '/customers/1/checkouts/5/delivery-info/',
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

    await screen.findByText(/Pick a day for/)
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()

    await waitFor(() => expect(NetworkError.publish).toHaveBeenCalled())
    expect(
      screen.queryByRole('dialog', {
        name: 'The selected delivery slot is no longer available',
      }),
    ).not.toBeInTheDocument()
  })

  it('should NOT show slot not available modal when confirm fails with slot_not_booked (flag OFF)', async () => {
    activeFeatureFlags([knownFeatureFlags.CHECKOUT_NEW_CONFIRM_STRATEGY])

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/checkouts/5/confirm/',
          method: 'post',
          status: 400,
          responseBody: {
            errors: [SlotNotBookedException.toJSON()],
          },
        },
      ])
      .withLogin()
      .mount()

    await confirmCheckout()

    await waitFor(() => expect(NetworkError.publish).toHaveBeenCalled())
    expect(
      screen.queryByRole('dialog', {
        name: 'The selected delivery slot is no longer available',
      }),
    ).not.toBeInTheDocument()
  })

  it('should NOT show slot not available modal when confirm fails with slot_not_booked (legacy strategy)', async () => {
    activeFeatureFlags([knownFeatureFlags.CHECKOUT_SLOT_NOT_AVAILABLE])

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/checkouts/5/orders/',
          method: 'post',
          status: 400,
          responseBody: {
            errors: [SlotNotBookedException.toJSON()],
          },
        },
      ])
      .withLogin()
      .mount()

    await confirmCheckout()

    await waitFor(() => expect(NetworkError.publish).toHaveBeenCalled())
    expect(
      screen.queryByRole('dialog', {
        name: 'The selected delivery slot is no longer available',
      }),
    ).not.toBeInTheDocument()
  })
})
