import { screen, within } from '@testing-library/react'

import {
  confirmAddressForm,
  confirmErrorAlert,
  confirmInaccurateAddressModal,
  locateMe,
} from './helpers'
import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { DeliveryAreaResponsesBuilder } from '__tests__/delivery-area/DeliveryAreaResponsesBuilder'
import { App, history } from 'app'
import { ADDRESS_ACCURACY } from 'app/address'
import {
  addressFormFill,
  addressRequestAccuracy,
  addressResponse,
} from 'app/address/__scenarios__/address'
import { checkoutWithoutAddress } from 'app/checkout/__scenarios__/checkout'
import { fillManualAddressForm } from 'pages/__tests__/helper'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Address Confirmed with map locate me generic error', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('should display generic error modal when gets an unknown error', async () => {
    global.navigator.geolocation = {
      getCurrentPosition: vi.fn((_, error) => {
        error({
          code: 99,
        })
      }),
    }

    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: checkoutWithoutAddress,
      },
      ...new AddressResponsesBuilder()
        .addMultipleGetResponse([[], [addressResponse]])
        .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.MEDIUM)
        .addPostalCodeViewportResponse()
        .build(),
      ...new DeliveryAreaResponsesBuilder()
        .addPostalCodeValidationResponse()
        .build(),
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')
    screen.getByText('Add where you want to receive your order.')
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    confirmAddressForm()

    await screen.findByText('We are having trouble finding your address')
    confirmInaccurateAddressModal()

    const alert = await screen.findByRole('dialog', {
      name: 'Indicate address',
    })

    locateMe()

    within(alert).findByLabelText('loader')

    const errorAlert = await screen.findByRole('dialog', {
      name: 'Your request cannot be processed',
    })
    confirmErrorAlert()

    expect(errorAlert).not.toBeInTheDocument()
  })
})
