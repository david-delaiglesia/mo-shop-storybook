import { screen, waitFor } from '@testing-library/react'

import {
  confirmSlot,
  selectFirstAvailableDay,
  selectFirstSlot,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { AddressNotInWarehouseException } from 'app/address'
import { AddressMother } from 'app/address/__scenarios__/AddressMother'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { SlotsMother } from 'app/delivery-area/__scenarios__/SlotsMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import { confirmAddressNotInWarehouseModal } from 'pages/__tests__/helpers/checkout'
import { knownFeatureFlags } from 'services/feature-flags'
import { NetworkError } from 'services/http'
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

function buildNetworkMocks(
  slots: ReturnType<typeof SlotsMother.withAvailableSlots>,
) {
  return [
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
      method: 'put' as const,
      status: 400,
      requestBody: {
        address: AddressMother.arquitectoMora(),
        slot: slots.results[0],
      },
      responseBody: {
        errors: [AddressNotInWarehouseException.toJSON()],
      },
    },
  ]
}

describe('Checkout - Address not in warehouse', () => {
  configure({
    changeRoute: history.push,
  })

  beforeEach(() => {
    activeFeatureFlags([
      knownFeatureFlags.CHECKOUT_NEW_CONFIRM_STRATEGY,
      knownFeatureFlags.CHECKOUT_ADDRESS_NOT_IN_WAREHOUSE,
    ])
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
  })

  it('should show address not in warehouse modal when delivery-info update fails with address_not_in_warehouse', async () => {
    const slots = SlotsMother.withAvailableSlots()

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork(buildNetworkMocks(slots))
      .withLogin()
      .mount()

    await screen.findByText(/Pick a day for/)
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()

    expect(
      await screen.findByRole('dialog', { name: 'Change of address' }),
    ).toBeInTheDocument()
  })

  it('should NOT show address not in warehouse modal when delivery-info update fails with address_not_in_warehouse (flag OFF)', async () => {
    activeFeatureFlags([knownFeatureFlags.CHECKOUT_NEW_CONFIRM_STRATEGY])

    const slots = SlotsMother.withAvailableSlots()

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork(buildNetworkMocks(slots))
      .withLogin()
      .mount()

    await screen.findByText(/Pick a day for/)
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()

    await waitFor(() => expect(NetworkError.publish).toHaveBeenCalled())
    expect(
      screen.queryByRole('dialog', { name: 'Change of address' }),
    ).not.toBeInTheDocument()
  })

  it('should redirect to home when modal action button is clicked', async () => {
    const slots = SlotsMother.withAvailableSlots()

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork(buildNetworkMocks(slots))
      .withLogin()
      .mount()

    await screen.findByText(/Pick a day for/)
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()

    await screen.findByRole('dialog', { name: 'Change of address' })
    await confirmAddressNotInWarehouseModal()

    expect(history.location.pathname).toBe('/')
  })

  it('should send change_hive_alert_view metric with reason unnecessary when modal is shown', async () => {
    const slots = SlotsMother.withAvailableSlots()

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork(buildNetworkMocks(slots))
      .withLogin()
      .mount()

    await screen.findByText(/Pick a day for/)
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()

    await screen.findByRole('dialog', { name: 'Change of address' })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_hive_alert_view',
      {
        reason: 'unnecessary',
      },
    )
  })
})
