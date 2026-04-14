import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { DeliveryAreaResponsesBuilder } from '__tests__/delivery-area/DeliveryAreaResponsesBuilder'
import {
  createAddressSuggestion,
  mockAddressSuggestions,
} from '__tests__/maps/helpers'
import { App, history } from 'app'
import {
  fillSuggestedAddressForm,
  openNewAddressForm,
} from 'pages/__tests__/helper'
import { selectManualAddress, typeAddress } from 'pages/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User area - Addresses - Suggestions', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Tracker.sendInteraction.mockClear()
    vi.clearAllMocks()
  })

  it('should show full form on select a suggestion', async () => {
    mockAddressSuggestions([
      createAddressSuggestion('RandomPlaceId', { street: 'Calle Colón' }),
    ])

    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addSuggestionAddress('RandomPlaceId', {
            street: 'False Street',
            number: '123',
            postal_code: '46010',
            town: 'Valencia',
            longitude: 12,
            latitude: 13,
            comments: null,
          })
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Add where you want to receive your order.')

    await fillSuggestedAddressForm(
      { address: 'Calle Colón' },
      'Calle Colón - València, España',
    )

    await screen.findByDisplayValue('46010')

    expect(screen.getByLabelText('Street name')).toHaveValue('False Street')
    expect(screen.getByLabelText('Number')).toHaveValue('123')
    expect(screen.getByLabelText('Floor, door...')).toHaveValue('')
    expect(screen.getByLabelText('Postal code')).toHaveValue('46010')
    expect(screen.getByLabelText('Town/City')).toHaveValue('Valencia')
    expect(
      screen.getByLabelText('Additional information (E.g. There is no lift)'),
    ).toHaveValue('')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('address_form_view', {
      flow_id: '10000000-1000-4000-8000-100000000000',
      street_name: 'False Street',
      street_number: '123',
      postal_code: '46010',
      town: 'Valencia',
      comments: null,
    })
  })

  it('should allow to select a suggested address', async () => {
    mockAddressSuggestions([
      createAddressSuggestion('RandomPlaceId', { street: 'Calle Colón' }),
    ])

    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addSuggestionAddress('RandomPlaceId', {
            street: 'Calle Colón',
            number: '1',
            postal_code: '46010',
            town: 'València',
            longitude: 12,
            latitude: 13,
            comments: null,
          })
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Add where you want to receive your order.')

    await fillSuggestedAddressForm(
      { address: 'Calle Col' },
      'Calle Colón - València, España',
    )
    await screen.findByDisplayValue('46010')

    expect(screen.getByLabelText('Street name')).toHaveValue('Calle Colón')
    expect(screen.getByLabelText('Number')).toHaveValue('1')
    expect(screen.getByLabelText('Postal code')).toHaveValue('46010')
    expect(screen.getByLabelText('Town/City')).toHaveValue('València')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_suggestion_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        user_input: 'Calle Col',
        suggestion_position: 1,
        selected_suggestion: 'Calle Colón - València, España',
        address_type: ['street_address', 'geocode'],
      },
    )
  })

  it('should allow to select the manual address added', async () => {
    mockAddressSuggestions([])

    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder().addEmptyResponse().build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    openNewAddressForm()
    await screen.findByText('Add where you want to receive your order.')

    typeAddress('Calle Col')
    selectManualAddress()

    expect(screen.getByLabelText('Street name')).toHaveValue('')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_manual_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        user_input: 'Calle Col',
        suggestions_amount: 0,
      },
    )
  })

  describe('Suggestion provider filters', () => {
    it('should filter only by acceptable types', async () => {
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
              number: null,
              postal_code: '46010',
              town: 'València',
              longitude: 12,
              latitude: 13,
              comments: null,
            })
            .build(),
          ...new DeliveryAreaResponsesBuilder()
            .addPostalCodeValidationResponse()
            .build(),
        ])
        .withLogin()
        .mount()

      await screen.findByText('Add where you want to receive your order.')

      await fillSuggestedAddressForm(
        { address: 'Calle Col' },
        'Calle Colón - València, España',
      )
      await screen.findByDisplayValue('46010')

      expect(
        window.google.maps.places.AutocompleteSuggestion
          .fetchAutocompleteSuggestions,
      ).toHaveBeenLastCalledWith({
        input: 'Calle Col',
        includedPrimaryTypes: [
          'establishment',
          'premise',
          'route',
          'street_address',
          'subpremise',
        ],
        includedRegionCodes: ['es'],
      })
    })
  })
})
