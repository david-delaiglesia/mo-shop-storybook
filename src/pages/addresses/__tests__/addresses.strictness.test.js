import { screen, waitFor, within } from '@testing-library/react'

import { saveAddress } from './helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { DeliveryAreaResponsesBuilder } from '__tests__/delivery-area/DeliveryAreaResponsesBuilder'
import { activeFeatureFlags } from '__tests__/helpers'
import {
  createAddressSuggestion,
  mockAddressSuggestions,
} from '__tests__/maps/helpers'
import { App, history } from 'app'
import { ADDRESS_ACCURACY } from 'app/address'
import {
  addressFormFill,
  address as primaryAddress,
} from 'app/address/__scenarios__/address'
import {
  fillManualAddressForm,
  fillSuggestedAddressForm,
} from 'pages/__tests__/helper'
import {
  confirmAdressConfirmationModal,
  confirmInaccurateAddressModal,
  idlePositionEvent,
} from 'pages/checkout/__tests__/helpers'
import { knownFeatureFlags } from 'services/feature-flags'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Address Strictness', () => {
  configure({ changeRoute: history.push })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should submit to new endpoint in manual flow and high accuracy', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([[], [primaryAddress]])
          .addCreationResponse(
            {
              flow_id: '10000000-1000-4000-8000-100000000000',
              street: 'Calle Arquitecto Mora',
              number: '10',
              postal_code: '46010',
              town: 'València',
              detail: 'Piso 8 Puerta 14',
              latitude: 39.4780024,
              longitude: -0.4226101,
            },
            {
              id: 1,
              address: 'Calle Arquitecto Mora, 10',
              address_detail: 'Piso 8 Puerta 14',
              postal_code: '46010',
              town: 'València',
              permanent_address: true,
              longitude: 4.8921,
              latitude: -0.1234,
            },
          )
          .addAccuracyResponse(
            {
              flowId: '10000000-1000-4000-8000-100000000000',
              street: 'Calle Arquitecto Mora',
              number: '10',
              postalCode: '46010',
              town: 'València',
            },
            ADDRESS_ACCURACY.HIGH,
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
    await fillManualAddressForm(primaryAddress)
    await screen.findByDisplayValue('46010')
    saveAddress()

    await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_form_save_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        address_street_name: 'Calle Arquitecto Mora',
        address_street_number: '10',
        address_floor_door: 'Piso 8 Puerta 14',
        address_zip_code: '46010',
        address_town: 'València',
        entered_manually: true,
      },
    )

    expect('/customers/1/addresses/accuracy/').toHaveBeenFetchedTimes(1)
    expect('/customers/1/address/').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        flow_id: '10000000-1000-4000-8000-100000000000',
        street: 'Calle Arquitecto Mora',
        number: '10',
        postal_code: '46010',
        town: 'València',
        detail: 'Piso 8 Puerta 14',
        latitude: 39.4780024,
        longitude: -0.4226101,
      },
    })

    await waitFor(() => {
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('address_saved', {
        flow_id: '10000000-1000-4000-8000-100000000000',
        address_id: 1,
        user_flow: 'manual_form',
      })
    })
  })

  it('should submit to new endpoint in manual flow and medium accuracy', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([[], [primaryAddress]])
          .addMapAddressReverse({
            street: 'Calle Arquitecto Mora',
            postalCode: '46009',
            town: 'Valencia',
            userFlow: 'map_coordinates',
          })
          .addCreationResponse(
            {
              flow_id: '10000000-1000-4000-8000-100000000000',
              street: 'Calle Arquitecto Mora',
              number: '10',
              postal_code: '46009',
              town: 'Valencia',
              detail: 'Piso 8 Puerta 14',
              latitude: 39.4756457,
              longitude: -0.3968569,
            },
            {
              id: 1,
              address: 'Calle Arquitecto Mora, 10',
              address_detail: 'Piso 8 Puerta 14',
              postal_code: '46010',
              town: 'València',
              permanent_address: true,
              longitude: 4.8921,
              latitude: -0.1234,
            },
          )
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
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .addPostalCodeValidationResponse('46009')
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm(primaryAddress)
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

    confirmAdressConfirmationModal()

    await waitFor(() => {
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_form_save_click',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          address_street_name: 'Calle Arquitecto Mora',
          address_street_number: '10',
          address_floor_door: 'Piso 8 Puerta 14',
          address_zip_code: '46010',
          address_town: 'València',
          entered_manually: true,
        },
      )

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_map_save_click',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          address_latitude: 39.4756457,
          address_longitude: -0.3968569,
          address_zip_code: '46009',
          address_town: 'Valencia',
          address_origin: 'map',
          zoom_level: 0,
          user_flow: 'map_coordinates',
        },
      )

      expect(Tracker.sendInteraction).toHaveBeenCalledWith('address_saved', {
        flow_id: '10000000-1000-4000-8000-100000000000',
        address_id: 1,
        user_flow: 'map_coordinates',
      })
    })
  })

  it('should submit to new endpoint in manual flow and low accuracy', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([[], [primaryAddress]])
          .addMapAddressReverse({
            street: 'Calle Arquitecto Mora',
            postalCode: '46009',
            town: 'Valencia',
            userFlow: 'map_cp',
          })
          .addValidationResponse({
            latitude: 39.4756457,
            longitude: -0.3968569,
            postal_code: '46009',
          })
          .addCreationResponse(
            {
              flow_id: '10000000-1000-4000-8000-100000000000',
              street: 'Calle Arquitecto Mora',
              number: '10',
              postal_code: '46009',
              town: 'Valencia',
              detail: 'Piso 8 Puerta 14',
              latitude: 39.4756457,
              longitude: -0.3968569,
            },
            {
              id: 1,
              address: 'Calle Arquitecto Mora, 10',
              address_detail: 'Piso 8 Puerta 14',
              postal_code: '46010',
              town: 'València',
              permanent_address: true,
              longitude: 4.8921,
              latitude: -0.1234,
            },
          )
          .addAccuracyResponse(
            {
              flowId: '10000000-1000-4000-8000-100000000000',
              street: 'Calle Arquitecto Mora',
              number: '10',
              postalCode: '46010',
              town: 'València',
            },
            ADDRESS_ACCURACY.LOW,
          )
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

    confirmAdressConfirmationModal()

    await waitFor(() => {
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_form_save_click',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          address_street_name: 'Calle Arquitecto Mora',
          address_street_number: '10',
          address_floor_door: 'Piso 8 Puerta 14',
          address_zip_code: '46010',
          address_town: 'València',
          entered_manually: true,
        },
      )

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_map_save_click',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          address_latitude: 39.4756457,
          address_longitude: -0.3968569,
          address_zip_code: '46009',
          address_town: 'Valencia',
          address_origin: 'map',
          zoom_level: 0,
          user_flow: 'map_cp',
        },
      )

      expect(Tracker.sendInteraction).toHaveBeenCalledWith('address_saved', {
        flow_id: '10000000-1000-4000-8000-100000000000',
        address_id: 1,
        user_flow: 'map_cp',
      })
    })
  })

  it('should submit to new endpoint in automatic flow', async () => {
    mockAddressSuggestions([
      createAddressSuggestion('RandomPlaceId', {
        street: 'Calle de Cristóbal Colón',
        number: '6',
      }),
    ])

    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([[], [primaryAddress]])
          .addCreationResponse(
            {
              flow_id: '10000000-1000-4000-8000-100000000000',
              street: 'Carrer de Colón',
              number: '6',
              postal_code: '46010',
              town: 'València',
              detail: 'Piso 8 Puerta 14',
              latitude: 13.0,
              longitude: 12.0,
              comments: '',
            },
            {
              id: 1,
              address: 'Calle Arquitecto Mora, 10',
              address_detail: 'Piso 8 Puerta 14',
              postal_code: '46010',
              town: 'València',
              permanent_address: true,
              longitude: 4.8921,
              latitude: -0.1234,
            },
          )
          .addSuggestionAddress('RandomPlaceId', {
            street: 'Carrer de Colón',
            number: '6',
            postal_code: '46010',
            town: 'València',
            longitude: 12,
            latitude: 13,
            comments: null,
          })
          .build(),
        {
          path: '/postal-codes/actions/retrieve-pc/46010/',
          status: 201,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillSuggestedAddressForm(
      { address: 'Calle Colón', detail: 'Piso 8 Puerta 14' },
      'Calle de Cristóbal Colón, 6 - València, España',
    )
    await screen.findByDisplayValue('46010')
    saveAddress()

    await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_form_save_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        address_street_name: 'Carrer de Colón',
        address_street_number: '6',
        address_floor_door: 'Piso 8 Puerta 14',
        address_zip_code: '46010',
        address_town: 'València',
        address_more_info: '',
        entered_manually: false,
      },
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('address_saved', {
      flow_id: '10000000-1000-4000-8000-100000000000',
      address_id: 1,
      user_flow: 'autocomplete',
    })
    expect('/customers/1/addresses/accuracy/*').not.toHaveBeenFetched()
  })

  it('should skip postal code validation when flag is active in manual flow with high accuracy', async () => {
    activeFeatureFlags([knownFeatureFlags.ADDRESS_POSTAL_CODE_CORRECTION])

    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([[], [primaryAddress]])
          .addCreationResponse(
            {
              flow_id: '10000000-1000-4000-8000-100000000000',
              street: 'Calle Arquitecto Mora',
              number: '10',
              postal_code: '46010',
              town: 'València',
              detail: 'Piso 8 Puerta 14',
              latitude: 39.4780024,
              longitude: -0.4226101,
            },
            {
              id: 1,
              address: 'Calle Arquitecto Mora, 10',
              address_detail: 'Piso 8 Puerta 14',
              postal_code: '46010',
              town: 'València',
              permanent_address: true,
              longitude: 4.8921,
              latitude: -0.1234,
            },
          )
          .addAccuracyResponse(
            {
              flowId: '10000000-1000-4000-8000-100000000000',
              street: 'Calle Arquitecto Mora',
              number: '10',
              postalCode: '46010',
              town: 'València',
            },
            ADDRESS_ACCURACY.HIGH,
          )
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm(primaryAddress)
    await screen.findByDisplayValue('46010')
    saveAddress()

    await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')

    expect('/postal-codes/actions/retrieve-pc/46010/').not.toHaveBeenFetched()
    expect('/customers/1/addresses/accuracy/').toHaveBeenFetchedTimes(1)
    expect('/customers/1/address/').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        flow_id: '10000000-1000-4000-8000-100000000000',
        street: 'Calle Arquitecto Mora',
        number: '10',
        postal_code: '46010',
        town: 'València',
        detail: 'Piso 8 Puerta 14',
        latitude: 39.4780024,
        longitude: -0.4226101,
      },
    })
  })

  it('should display AddressWrongPostalCodeModal in manual flow with high accuracy when suggested postal code differs', async () => {
    activeFeatureFlags([knownFeatureFlags.ADDRESS_POSTAL_CODE_CORRECTION])

    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([
            [],
            [
              {
                ...primaryAddress,
                postal_code: '46009',
              },
            ],
          ])
          .addAccuracyResponse(
            {
              flowId: '10000000-1000-4000-8000-100000000000',
              street: 'Calle Arquitecto Mora',
              number: '10',
              postalCode: '46010',
              town: 'València',
            },
            ADDRESS_ACCURACY.HIGH,
            '46009',
          )
          .addAccuracyResponse(
            {
              flowId: '10000000-1000-4000-8000-100000000000',
              street: 'Calle Arquitecto Mora',
              number: '10',
              postalCode: '46009',
              town: 'València',
            },
            ADDRESS_ACCURACY.HIGH,
          )
          .addCreationResponse(
            {
              flow_id: '10000000-1000-4000-8000-100000000000',
              street: 'Calle Arquitecto Mora',
              number: '10',
              postal_code: '46009',
              town: 'València',
              detail: 'Piso 8 Puerta 14',
              latitude: 39.4780024,
              longitude: -0.4226101,
            },
            {
              id: 1,
              address: 'Calle Arquitecto Mora, 10',
              address_detail: 'Piso 8 Puerta 14',
              postal_code: '46009',
              town: 'València',
              permanent_address: true,
              longitude: 4.8921,
              latitude: -0.1234,
            },
          )
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm(primaryAddress)
    await screen.findByDisplayValue('46010')
    saveAddress()

    const modalAddressWrongPostalCode = await screen.findByRole('dialog', {
      name: 'The post code does not match the address',
    })
    const saveButton = within(modalAddressWrongPostalCode).getByRole('button', {
      name: 'Save suggestion',
    })

    expect(modalAddressWrongPostalCode).toHaveTextContent(
      'The post code does not match the address',
    )
    expect(modalAddressWrongPostalCode).toHaveTextContent('Suggested address:')
    expect(modalAddressWrongPostalCode).toHaveTextContent(
      'Calle Arquitecto Mora',
    )
    expect(modalAddressWrongPostalCode).toHaveTextContent('10')
    expect(modalAddressWrongPostalCode).toHaveTextContent('46009')
    expect(modalAddressWrongPostalCode).toHaveTextContent('València')

    expect(saveButton).toBeInTheDocument()
    expect(
      within(modalAddressWrongPostalCode).getByRole('button', {
        name: 'Edit address',
      }),
    ).toBeInTheDocument()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_wrong_postal_code_view',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        postal_code_suggested: '46009',
      },
    )

    userEvent.click(saveButton)

    await waitFor(() => {
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_wrong_postal_code_save_click',
      )
      expect('/customers/1/address/').toHaveBeenFetched()
    })

    await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')
  })
})
