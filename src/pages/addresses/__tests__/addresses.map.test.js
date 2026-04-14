import { screen, within } from '@testing-library/react'

import { saveAddress } from './helpers'
import { configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { DeliveryAreaResponsesBuilder } from '__tests__/delivery-area/DeliveryAreaResponsesBuilder'
import { App, history } from 'app'
import {
  ADDRESS_ACCURACY,
  ReverseGeocodingNotFoundException,
} from 'app/address'
import {
  addressFormFill,
  addressRequestAccuracy,
} from 'app/address/__scenarios__/address'
import { fillManualAddressForm } from 'pages/__tests__/helper'
import {
  confirmInaccurateAddressModal,
  idlePositionEvent,
} from 'pages/checkout/__tests__/helpers'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User area - Addresses - Map accuracy', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should hide label on pin drop in map with managed error', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.MEDIUM)
          .addMapAddressReverse({
            street: 'Calle Arquitecto Mora',
            number: '10',
            postalCode: '46010',
            town: 'València',
            userFlow: 'map_coordinates',
          })
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    saveAddress()

    await screen.findByText('We are having trouble finding your address')
    confirmInaccurateAddressModal()

    const alert = await screen.findByRole('dialog', {
      name: 'Indicate address',
    })

    expect(alert).toBeInTheDocument()
    const map = window.google.maps.Map()

    await idlePositionEvent(map)

    expect(within(alert).getByRole('status')).toHaveTextContent(
      '46010, València',
    )
  })

  it('should show label on pin drop in map', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.MEDIUM)
          .addMapAddressReverseError(ReverseGeocodingNotFoundException)
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    saveAddress()

    await screen.findByText('We are having trouble finding your address')
    confirmInaccurateAddressModal()

    const alert = await screen.findByRole('dialog', {
      name: 'Indicate address',
    })

    expect(alert).toBeInTheDocument()
    const map = window.google.maps.Map()

    await idlePositionEvent(map)

    expect(within(alert).queryByRole('status')).not.toBeInTheDocument()
  })
})
