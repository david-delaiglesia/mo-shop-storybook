import { screen } from '@testing-library/react'

import { goBack, openAddressForm } from './helpers'
import { configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { DeliveryAreaResponsesBuilder } from '__tests__/delivery-area/DeliveryAreaResponsesBuilder'
import {
  createAddressSuggestion,
  mockAddressSuggestions,
} from '__tests__/maps/helpers'
import { App, history } from 'app'
import { addressResponse } from 'app/address/__scenarios__/address'
import {
  fillManualAddressForm,
  fillSuggestedAddressForm,
  openNewAddressForm,
} from 'pages/__tests__/helper'
import { editAddressStreet } from 'pages/helpers'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User area - Addresses Single', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should only show suggestion input on start', async () => {
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

    expect(screen.getByLabelText('Street and number')).toBeInTheDocument()
    expect(screen.queryByLabelText('Street name')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Number')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Floor, door...')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Postal code')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Town/City')).not.toBeInTheDocument()
    expect(
      screen.queryByLabelText('Additional information (E.g. There is no lift)'),
    ).not.toBeInTheDocument()
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

    await screen.findByText('Addresses', { selector: 'h1' })

    await fillSuggestedAddressForm(
      { address: 'Calle Col' },
      'Calle Colón - València, España',
    )
    await screen.findByDisplayValue('46010')

    expect(screen.queryByLabelText('Street and number')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Street name')).toBeInTheDocument()
    expect(screen.getByLabelText('Number')).toBeInTheDocument()
    expect(screen.getByLabelText('Floor, door...')).toBeInTheDocument()
    expect(screen.getByLabelText('Postal code')).toBeInTheDocument()
    expect(screen.getByLabelText('Town/City')).toBeInTheDocument()
    expect(
      screen.getByLabelText('Additional information (E.g. There is no lift)'),
    ).toBeInTheDocument()
  })

  it('should focus to address on select a suggestion without street', async () => {
    mockAddressSuggestions([
      createAddressSuggestion('RandomPlaceId', { street: 'Calle Colón' }),
    ])

    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addSuggestionAddress('RandomPlaceId', {
            street: null,
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

    await screen.findByText('Addresses', { selector: 'h1' })

    await fillSuggestedAddressForm(
      { address: 'Calle Col' },
      'Calle Colón - València, España',
    )
    await screen.findByDisplayValue('46010')

    expect(screen.getByLabelText('Street name')).toHaveFocus()
  })

  it('should not focus to address on select manual suggestion', async () => {
    mockAddressSuggestions([])

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

    await screen.findByText('Addresses', { selector: 'h1' })

    await fillManualAddressForm(
      { address: 'Calle Col', postal_code: '46010' },
      'Calle Colón - València, España',
    )
    await screen.findByDisplayValue('46010')

    expect(screen.getByLabelText('Street name')).not.toHaveFocus()
  })

  it('should edit street address without show suggestions again', async () => {
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

    editAddressStreet(' edited')

    expect(screen.queryByLabelText('Street and number')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Street name')).toBeInTheDocument()
    expect(screen.getByLabelText('Street name')).toHaveValue(
      'Carrer de Colón edited',
    )
  })

  describe('Go previous step button', () => {
    it('should not show cancel button in single mode with empty addresses', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder().addEmptyResponse().build(),
        ])
        .withLogin()
        .mount()

      await screen.findByText('Add where you want to receive your order.')

      expect(
        screen.queryByRole('button', { name: 'Cancel' }),
      ).not.toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Go back' }),
      ).not.toBeInTheDocument()
    })

    it('should show cancel button in single mode', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder()
            .addGetResponse([addressResponse])
            .build(),
        ])
        .withLogin()
        .mount()

      await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')
      openAddressForm()

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Go back' }),
      ).not.toBeInTheDocument()
    })

    it('should show previous button in full mode', async () => {
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
        screen.getByRole('button', { name: 'Go back' }),
      ).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'Cancel' }),
      ).not.toBeInTheDocument()
    })

    it('should go back in full mode to single mode', async () => {
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

      goBack()

      expect(screen.queryByLabelText('Street name')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Street and number')).toBeInTheDocument()
    })

    it('should show the suggestion writed on go back', async () => {
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

      goBack()

      expect(screen.getByLabelText('Street and number')).toHaveDisplayValue(
        'Calle Col',
      )
    })
  })
})
