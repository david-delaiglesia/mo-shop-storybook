import { screen, within } from '@testing-library/react'

import {
  closeLocateMeWarningModal,
  confirmAddressForm,
  confirmInaccurateAddressModal,
  idlePositionEvent,
  locateMe,
} from './helpers'
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
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Address Confirmed with map locate me', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('should navigate to current location on locate me', async () => {
    global.navigator.geolocation = {
      getCurrentPosition: vi.fn((successCallback) => {
        successCallback({
          coords: {
            latitude: 40.7128,
            longitude: -74.006,
          },
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
        .addMapAddressReverse({
          street: 'Calle Arquitecto Mora',
          postalCode: '46009',
          town: 'Valencia',
          userFlow: 'map_coordinates',
        })
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

    within(alert).getByLabelText('loader')

    const map = window.google.maps.Map()
    await idlePositionEvent(map)

    const images = within(alert).getAllByRole('img')

    expect(within(alert).getByText('46009, Valencia')).toBeInTheDocument()
    expect(images[0]).toHaveClass('address-confirmation-modal__locate-me-icon')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_map_locate_me_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        address_latitude: 40.7128,
        address_longitude: -74.006,
      },
    )
  })

  it('should close warning modal when gets an error trying to locate', async () => {
    global.navigator.geolocation = {
      getCurrentPosition: vi.fn((_, error) => {
        error({
          code: 1,
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

    await screen.findByRole('dialog', {
      name: 'Indicate address',
    })

    locateMe()

    await screen.findByRole('dialog', {
      name: "The browser has blocked access to your location. Change your browser's privacy settings to use your location.",
    })
    closeLocateMeWarningModal()

    expect(
      screen.queryByRole('dialog', {
        name: "The browser has blocked access to your location. Change your browser's privacy settings to use your location.",
      }),
    ).not.toBeInTheDocument()
  })

  it('should display warning modal when gets an error trying to locate', async () => {
    global.navigator.geolocation = {
      getCurrentPosition: vi.fn((_, error) => {
        error({
          code: 1,
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

    const warningModal = await screen.findByRole('dialog', {
      name: "The browser has blocked access to your location. Change your browser's privacy settings to use your location.",
    })

    expect(warningModal).toBeInTheDocument()
    expect(
      within(warningModal).getByAltText('Warning icon'),
    ).toBeInTheDocument()
    expect(
      within(warningModal).getByText(
        `Change your browser's privacy settings to use your location.`,
      ),
    ).toBeInTheDocument()
    expect(
      within(warningModal).getByRole('button', {
        name: 'OK',
      }),
    ).toBeInTheDocument()
  })
})
