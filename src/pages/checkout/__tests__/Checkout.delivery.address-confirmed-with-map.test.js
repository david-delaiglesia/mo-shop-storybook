import { screen, within } from '@testing-library/react'

import {
  centeredChangedEvent,
  closeAdressConfirmationModal,
  confirmAddressForm,
  confirmAdressConfirmationModal,
  confirmInaccurateAddressModal,
  idlePositionEvent,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { DeliveryAreaResponsesBuilder } from '__tests__/delivery-area/DeliveryAreaResponsesBuilder'
import { App, history } from 'app'
import { ADDRESS_ACCURACY } from 'app/address'
import {
  addressFormFill,
  addressRequest,
  addressRequestAccuracy,
  addressResponse,
} from 'app/address/__scenarios__/address'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { slotsMock } from 'containers/slots-container/__tests__/mocks'
import { fillManualAddressForm } from 'pages/__tests__/helper'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Address Confirmed with map', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('should display the modal alert when the post to create an address returns a 400 with a specific error code', async () => {
    const map = vi.spyOn(window.google.maps, 'Map')
    const responses = [
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.withoutDeliveryInfo(),
      },
      ...new AddressResponsesBuilder()
        .addMultipleGetResponse([[], [addressResponse]])
        .addCreationResponse(addressRequest, addressResponse)
        .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.MEDIUM)
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
    const pinImage = within(alert).getByRole('img', { name: 'Pin' })

    expect(map).toHaveBeenCalledTimes(1)
    expect(map).toHaveBeenCalledWith(expect.anything(), {
      styles: [
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'on' }],
        },
      ],
      clickableIcons: false,
      draggable: true,
      draggableCursor: 'default',
      fullscreenControl: false,
      mapTypeControl: true,
      streetViewControl: false,
      zoomControl: true,
      zoom: 8,
      controlSize: 28,
      mapTypeId: 'roadmap',
      tilt: 0,
      mapTypeControlOptions: {
        mapTypeIds: ['roadmap', 'hybrid'],
        style: 'horizontal_bar',
      },
      restriction: {
        latLngBounds: {
          east: 150,
          north: 85,
          south: -85,
          west: -150,
        },
        strictBounds: true,
      },
    })
    expect(
      within(alert).getByText('Move the map to find your address'),
    ).toBeInTheDocument()
    expect(pinImage).toHaveAttribute('src', '/src/app/assets/pin.png')
  })

  it('should close the modal alert', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.withoutDeliveryInfo(),
      },
      ...new AddressResponsesBuilder()
        .addMultipleGetResponse([[], [addressResponse]])
        .addCreationResponse(addressRequest, addressResponse)
        .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.MEDIUM)
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

    closeAdressConfirmationModal()

    expect(
      within(alert).queryByText('Indicate address'),
    ).not.toBeInTheDocument()
  })

  it('should show the postal code when the idle event is dispatched', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.withoutDeliveryInfo(),
      },
      ...new AddressResponsesBuilder()
        .addMultipleGetResponse([[], [addressResponse]])
        .addMapAddressReverse({
          street: 'Calle Arquitecto Mora',
          postalCode: '46009',
          town: 'Valencia',
          userFlow: 'map_coordinates',
        })
        .addCreationResponse(addressRequest, addressResponse)
        .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.MEDIUM)
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
    const map = window.google.maps.Map()

    await idlePositionEvent(map)

    expect(within(alert).getByText('46009, Valencia')).toBeInTheDocument()
  })

  it('should show the loader when the center_changed event is dispatched', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.withoutDeliveryInfo(),
      },
      ...new AddressResponsesBuilder()
        .addMultipleGetResponse([[], [addressResponse]])
        .addCreationResponse(addressRequest, addressResponse)
        .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.MEDIUM)
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
    const map = window.google.maps.Map()

    await centeredChangedEvent(map)

    expect(within(alert).getByLabelText('loader')).toBeInTheDocument()
  })

  it('should get the postal code, locality and coordinates on confirm map modal', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([[], [addressResponse]])
          .addMapAddressReverse({
            street: 'Calle Arquitecto Mora',
            postalCode: '46009',
            town: 'Valencia',
            userFlow: 'map_coordinates',
          })
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.MEDIUM)
          .addCreationResponse(
            {
              ...addressRequest,
              postal_code: '46009',
              town: 'Valencia',
              latitude: 39.4756457,
              longitude: -0.3968569,
            },
            addressResponse,
          )
          .addPostalCodeViewportResponse()
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutDeliveryInfo(),
        },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: slotsMock,
        },
        {
          path: '/customers/1/addresses/1/make_default/',
          method: 'patch',
        },
        {
          path: '/customers/1/orders/cart/drafts/',
          method: 'get',
        },
      ])
      .withLogin()
      .mount()

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
    const map = window.google.maps.Map()

    await idlePositionEvent(map)

    confirmAdressConfirmationModal()
    within(alert).getByLabelText('loader')

    await screen.findByText('Delivery')

    expect(alert).not.toBeInTheDocument()
    expect(
      screen.getByText('Choose a day to display the available delivery times'),
    ).toBeInTheDocument()
  })
})

describe('Address Confirmed with map metrics', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.clearAllMocks()
  })

  it('should dispatch address_not_found_modal_click on inaccurate addrress modal click', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutDeliveryInfo(),
        },
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.LOW)
          .addPostalCodeViewportResponse()
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    screen.getByText('Add where you want to receive your order.')
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    confirmAddressForm()

    await screen.findByText('We are having trouble finding your address')
    confirmInaccurateAddressModal()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_not_found_modal_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
      },
    )
  })

  it('should dispatch address_map_view on address map modal', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addPostalCodeViewportResponse()
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.LOW)
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutDeliveryInfo(),
        },
      ])
      .withLogin()
      .mount()

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

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('address_map_view', {
      flow_id: '10000000-1000-4000-8000-100000000000',
      address_street_name: 'Calle Arquitecto Mora',
      address_street_number: '10',
      address_zip_code: '46010',
      address_town: 'València',
      user_flow: 'map_cp',
    })
  })

  it('should dispatch address_map_back_click on closing address map modal', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.withoutDeliveryInfo(),
      },
      ...new AddressResponsesBuilder()
        .addEmptyResponse()
        .addPostalCodeViewportResponse()
        .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.LOW)
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

    const map = window.google.maps.Map()

    await idlePositionEvent(map)

    closeAdressConfirmationModal()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_map_back_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        address_latitude: 39.4756457,
        address_longitude: -0.3968569,
      },
    )
  })
})
