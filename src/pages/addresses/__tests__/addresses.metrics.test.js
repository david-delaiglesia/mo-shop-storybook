import { screen } from '@testing-library/react'

import {
  confirmNotAvailablePostalCodeAlert,
  fillAddressNumberField,
  removeLastCharacterFromTownField,
  removeLastCharacterFromValidPostalCodeField,
  saveAddress,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { DeliveryAreaResponsesBuilder } from '__tests__/delivery-area/DeliveryAreaResponsesBuilder'
import {
  createAddressSuggestion,
  mockAddressSuggestions,
} from '__tests__/maps/helpers'
import { App, history } from 'app'
import { ADDRESS_ACCURACY } from 'app/address'
import {
  addressFormFill,
  addressRequestAccuracy,
  addressResponse,
} from 'app/address/__scenarios__/address'
import {
  fillManualAddressForm,
  fillSuggestedAddressForm,
  openNewAddressForm,
} from 'pages/__tests__/helper'
import {
  confirmInaccurateAddressModal,
  idlePositionEvent,
  maptypeidChangedEvent,
} from 'pages/checkout/__tests__/helpers'
import { editAddressStreet } from 'pages/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('addresses - metrics', () => {
  configure({ changeRoute: history.push })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("sends a `address_alert_no_service_ok_button_click` event when the no service alert's ok button is clicked", async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([[], [addressResponse]])
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationErrorResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue(addressFormFill.postal_code)
    saveAddress()

    await screen.findByRole('dialog')
    confirmNotAvailablePostalCodeAlert()

    await screen.findByRole('heading', { name: 'Addresses' })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_alert_no_service_ok_button_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        no_service_reason: 'postal_code',
      },
    )
  })

  it('should dispatch address_map_pin_drop when pin was moved in the map', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.MEDIUM)
          .addMapAddressReverse({
            street: 'Calle Arquitecto Mora',
            postalCode: '46009',
            town: 'Madrid',
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

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_map_pin_drop',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        user_flow: 'map_coordinates',
        latitude: 39.4756457,
        longitude: -0.3968569,
        postal_code: '46009',
        locality: 'Madrid',
        zoom_level: 0,
        continue_button_enabled: true,
      },
    )
  })

  it('should dispatch address_map_change_view_type on confirm map modal', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addAccuracyResponse(
            {
              flowId: '10000000-1000-4000-8000-100000000000',
              street: 'Calle Arquitecto Mora',
              number: '10',
              postalCode: '46010',
              town: 'València',
            },
            ADDRESS_ACCURACY.MEDIUM,
          )
          .build(),
        {
          path: '/postal-codes/actions/retrieve-pc/46010/',
          status: 201,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    saveAddress()

    await screen.findByText('We are having trouble finding your address')
    confirmInaccurateAddressModal()

    await screen.findByRole('dialog', {
      name: 'Indicate address',
    })
    const map = window.google.maps.Map()

    await maptypeidChangedEvent(map)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_map_change_view_type',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        type: 'satelite',
      },
    )
  })

  describe('When changed to manual mode send address_manual_mode_activated metric', () => {
    it('should send metric when edit street input', async () => {
      mockAddressSuggestions([
        createAddressSuggestion('RandomPlaceId', {
          street: 'Calle Colón',
        }),
      ])

      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder()
            .addEmptyResponse()
            .addSuggestionAddress('RandomPlaceId', {
              street: 'Carrer de Colón',
              number: '10',
              postal_code: '46010',
              town: 'València',
              longitude: 12,
              latitude: 13,
              comments: 'Comments',
            })
            .build(),
          ...new DeliveryAreaResponsesBuilder()
            .addPostalCodeValidationResponse()
            .build(),
        ])
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Addresses' })

      await fillSuggestedAddressForm(
        { address: 'Calle Col' },
        'Calle Colón - València, España',
      )
      await screen.findByDisplayValue('46010')

      editAddressStreet(' edited', { blur: true })

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_manual_mode_activated',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          street_name: 'Carrer de Colón edited',
        },
      )
    })

    it('should send metric when edit street number input', async () => {
      mockAddressSuggestions([
        createAddressSuggestion('RandomPlaceId', {
          street: 'Calle Colón',
        }),
      ])

      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder()
            .addEmptyResponse()
            .addSuggestionAddress('RandomPlaceId', {
              street: 'Carrer de Colón',
              number: '10',
              postal_code: '46010',
              town: 'València',
              longitude: 12,
              latitude: 13,
              comments: 'Comments',
            })
            .build(),
          ...new DeliveryAreaResponsesBuilder()
            .addPostalCodeValidationResponse()
            .build(),
        ])
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Addresses' })

      await fillSuggestedAddressForm(
        { address: 'Calle Col' },
        'Calle Colón - València, España',
      )
      await screen.findByDisplayValue('46010')

      fillAddressNumberField('9876543', { blur: true })

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_manual_mode_activated',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          street_number: '109876543',
        },
      )
    })

    it('should send metric when edit postal code input', async () => {
      mockAddressSuggestions([
        createAddressSuggestion('RandomPlaceId', {
          street: 'Calle Colón',
        }),
      ])

      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder()
            .addEmptyResponse()
            .addSuggestionAddress('RandomPlaceId', {
              street: 'Carrer de Colón',
              number: '1',
              postal_code: '46010',
              town: 'València',
              longitude: 12,
              latitude: 13,
              comments: 'Comments',
            })
            .build(),
          ...new DeliveryAreaResponsesBuilder()
            .addPostalCodeValidationResponse()
            .build(),
        ])
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Addresses' })

      await fillSuggestedAddressForm(
        { address: 'Calle Col' },
        'Calle Colón - València, España',
      )
      await screen.findByDisplayValue('46010')

      removeLastCharacterFromValidPostalCodeField({ blur: true })

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_manual_mode_activated',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          zip_code: '4601',
        },
      )
    })

    it('should send metric when edit town input', async () => {
      mockAddressSuggestions([
        createAddressSuggestion('RandomPlaceId', {
          street: 'Calle Colón',
        }),
      ])

      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder()
            .addEmptyResponse()
            .addSuggestionAddress('RandomPlaceId', {
              street: 'Carrer de Colón',
              number: '1',
              postal_code: '46010',
              town: 'València',
              longitude: 12,
              latitude: 13,
              comments: 'Comments',
            })
            .build(),
          ...new DeliveryAreaResponsesBuilder()
            .addPostalCodeValidationResponse()
            .build(),
        ])
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Addresses' })

      await fillSuggestedAddressForm(
        { address: 'Calle Col' },
        'Calle Colón - València, España',
      )
      await screen.findByDisplayValue('46010')

      removeLastCharacterFromTownField({ blur: true })

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_manual_mode_activated',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          town: 'Valènci',
        },
      )
    })
  })

  it('should not send address_search_view on view CTA', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder().addEmptyResponse().build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })

    expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
      'address_search_view',
      {
        flow_id: expect.anything(),
      },
    )
  })

  it('should send address_search_view on enter', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder().addEmptyResponse().build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    openNewAddressForm()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_search_view',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
      },
    )
  })
})
