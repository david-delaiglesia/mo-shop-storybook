import { screen, within } from '@testing-library/react'

import {
  confirmAddressConfirmationModal,
  confirmErrorAlert,
  confirmIncompleteErrorAlert,
  confirmNotAvailablePostalCodeAlert,
  saveAddress,
} from './helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { DeliveryAreaResponsesBuilder } from '__tests__/delivery-area/DeliveryAreaResponsesBuilder'
import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  ADDRESS_ACCURACY,
  AddressOutOfDeliveryException,
  CoordinatesOutsideAllowedCountryException,
  PostalCodeWithoutServiceException,
} from 'app/address'
import {
  addressFormFill,
  addressRequest,
  addressRequestAccuracy,
  addressResponse,
} from 'app/address/__scenarios__/address'
import { fillManualAddressForm } from 'pages/__tests__/helper'
import {
  confirmInaccurateAddressModal,
  idlePositionEvent,
} from 'pages/checkout/__tests__/helpers'
import { knownFeatureFlags } from 'services/feature-flags'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User area - Addresses - Alert', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should display the no service alert due a postal code invalidation', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder().addEmptyResponse().build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationErrorResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    await fillManualAddressForm(addressFormFill)
    saveAddress()

    const alert = await screen.findByRole('dialog', {
      name: 'Postal code without service',
    })

    expect(
      within(alert).getByAltText('no service postal code'),
    ).toBeInTheDocument()
    expect(alert).toHaveTextContent('Postal code without service')
    expect(alert).toHaveTextContent(
      'The online service is not available in this address. You can use mercadona.es',
    )
    expect(alert).toHaveTextContent('OK')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_alert_no_service_view',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        no_service_reason: 'postal_code',
      },
    )
  })

  it('should display the no service alert due a exception invalidation', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([[], [addressResponse]])
          .addCreationErrorResponse(
            AddressOutOfDeliveryException,
            addressRequest,
          )
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.HIGH)
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

    const alert = await screen.findByRole('dialog', {
      name: 'Without service',
    })

    expect(
      within(alert).getByAltText('no service due to exclusion'),
    ).toBeInTheDocument()

    expect(alert).toHaveTextContent(
      'We are sorry, the address entered is outside of our delivery area',
    )
    expect(alert).toHaveTextContent('OK')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_alert_no_service_view',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        no_service_reason: 'exclusion',
      },
    )
  })

  it('should display address fields filled when the post to create an address returns a 400 with a specific error', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addCreationErrorResponse(
            AddressOutOfDeliveryException,
            addressRequest,
          )
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.HIGH)
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    saveAddress()
    await screen.findByRole('dialog', { name: 'Without service' })
    confirmErrorAlert()

    expect(screen.getByLabelText('Street name')).toHaveValue(
      'Calle Arquitecto Mora',
    )
    expect(screen.getByLabelText('Postal code')).toHaveValue('46010')
    expect(screen.getByLabelText('Town/City')).toHaveValue('València')
    expect(screen.getByLabelText('Floor, door...')).toHaveValue(
      'Piso 8 Puerta 14',
    )
  })

  it('should display an alert when the user has no addresses and they add an address with diff post code from onboarding', async () => {
    const postCodeBarcelona = '08037'

    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder().addEmptyResponse().build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse(postCodeBarcelona)
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    await fillManualAddressForm({
      address: 'Avinguda Diagonal, 1',
      address_detail: '2',
      postal_code: postCodeBarcelona,
      town: 'Barcelona',
    })
    await screen.findByText('Addresses', { selector: 'h1' })
    saveAddress()
    const alert = await screen.findByRole('dialog', { name: 'Are you sure?' })

    expect(alert).toHaveTextContent('The address you have just added is in:')
    expect(alert).toHaveTextContent('Barcelona')
    expect(
      within(alert).getByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument()
    expect(
      within(alert).getByRole('button', { name: 'Edit address' }),
    ).toBeInTheDocument()

    expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
      'address_alert_incomplete_view',
      expect.anything(),
    )
  })

  it('should be able to close no service alert from button', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder().addEmptyResponse().build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationErrorResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    await fillManualAddressForm(addressFormFill)
    saveAddress()
    await screen.findByRole('dialog')
    confirmNotAvailablePostalCodeAlert()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_alert_no_service_ok_button_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        no_service_reason: 'postal_code',
      },
    )
  })

  it('should display the system alert when the post to create an address returns a 400 with a specific error', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addCreationErrorResponse(
            CoordinatesOutsideAllowedCountryException,
            addressRequest,
          )
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.HIGH)
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    await fillManualAddressForm(addressFormFill)
    await screen.findByText('Addresses', { selector: 'h1' })
    saveAddress()

    const alert = await screen.findByRole('dialog', {
      name: 'Without service',
    })

    const okButton = within(alert).getByRole('button', { name: 'OK' })

    expect(within(alert).getByAltText('no service country')).toBeInTheDocument()
    expect(alert).toHaveTextContent(
      'We are sorry, the address entered is outside of our delivery area',
    )
    expect(okButton).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_alert_no_service_view',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        no_service_reason: 'country',
      },
    )

    userEvent.click(okButton)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_alert_no_service_ok_button_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        no_service_reason: 'country',
      },
    )
  })

  describe('when address number and details are empty', () => {
    it('should display an alert', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder().addEmptyResponse().build(),
        ])
        .withLogin()
        .mount()

      await screen.findByText('Addresses', { selector: 'h1' })
      await fillManualAddressForm({
        address: 'Calle Arquitecto Mora',
        postal_code: '46010',
        town: 'València',
      })

      await screen.findByDisplayValue('46010')

      saveAddress()
      const alert = await screen.findByRole('dialog', {
        name: 'Address incomplete',
      })

      expect(alert).toHaveTextContent('Address incomplete')
      expect(alert).toHaveTextContent(
        'No number, floor or door number. Please add them for greater accuracy.',
      )
      expect(
        within(alert).getByRole('button', { name: 'Save' }),
      ).toBeInTheDocument()
      expect(
        within(alert).getByRole('button', { name: 'Add details' }),
      ).toBeInTheDocument()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_incomplete_view',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          street_number: 'incomplete',
          floor_door: 'incomplete',
          alert_origin: 'no_details',
        },
      )
    })

    it('should focus to number input on click on alert update button', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder().addEmptyResponse().build(),
        ])
        .withLogin()
        .mount()

      await screen.findByText('Addresses', { selector: 'h1' })
      await fillManualAddressForm({
        address: 'Calle Arquitecto Mora',
        postal_code: '46010',
        town: 'València',
      })

      await screen.findByDisplayValue('46010')

      saveAddress()
      const alert = await screen.findByRole('dialog', {
        name: 'Address incomplete',
      })

      userEvent.click(
        within(alert).getByRole('button', { name: 'Add details' }),
      )

      expect(alert).not.toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Number' })).toHaveFocus()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_incomplete_edit_click',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
        },
      )
    })

    it('should submit on save click', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder()
            .addMultipleGetResponse([[], [addressResponse]])
            .addAccuracyResponse(
              { ...addressRequestAccuracy, number: undefined },
              ADDRESS_ACCURACY.HIGH,
            )
            .addCreationResponse(
              { ...addressRequest, number: undefined, detail: undefined },
              addressResponse,
            )
            .build(),
          ...new DeliveryAreaResponsesBuilder()
            .addPostalCodeValidationResponse()
            .build(),
        ])
        .withLogin()
        .mount()

      await screen.findByText('Addresses', { selector: 'h1' })
      await fillManualAddressForm({
        address: 'Calle Arquitecto Mora',
        postal_code: '46010',
        town: 'València',
      })

      await screen.findByDisplayValue('46010')

      saveAddress()

      const alert = await screen.findByRole('dialog', {
        name: 'Address incomplete',
      })
      confirmIncompleteErrorAlert()

      expect(alert).not.toBeInTheDocument()

      await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_incomplete_save_click',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
        },
      )
    })
  })

  describe('when address number is empty', () => {
    it('should display an alert', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder().addEmptyResponse().build(),
        ])
        .withLogin()
        .mount()

      await screen.findByText('Addresses', { selector: 'h1' })
      await fillManualAddressForm({
        address: 'Calle Arquitecto Mora',
        postal_code: '46010',
        town: 'València',
        address_detail: 'Puerta 1',
      })

      await screen.findByDisplayValue('46010')

      saveAddress()
      const alert = await screen.findByRole('dialog', {
        name: 'Address without street number',
      })

      expect(alert).toHaveTextContent('Address without street number')
      expect(alert).toHaveTextContent(
        'If you have a street number, please add it to complete the address.',
      )
      expect(
        within(alert).getByRole('button', {
          name: 'Save',
        }),
      ).toBeInTheDocument()
      expect(
        within(alert).getByRole('button', { name: 'Add number' }),
      ).toBeInTheDocument()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_incomplete_view',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          street_number: 'incomplete',
          floor_door: 'Puerta 1',
          alert_origin: 'no_street_number',
        },
      )
    })

    it('should focus to details input on click on alert update button', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder().addEmptyResponse().build(),
        ])
        .withLogin()
        .mount()

      await screen.findByText('Addresses', { selector: 'h1' })
      await fillManualAddressForm({
        address: 'Calle Arquitecto Mora',
        postal_code: '46010',
        town: 'València',
        address_detail: 'Puerta 1',
      })

      await screen.findByDisplayValue('46010')

      saveAddress()
      const alert = await screen.findByRole('dialog', {
        name: 'Address without street number',
      })

      userEvent.click(within(alert).getByRole('button', { name: 'Add number' }))

      expect(alert).not.toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'Number' })).toHaveFocus()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_incomplete_edit_click',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
        },
      )
    })

    it('should submit on save click', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder()
            .addMultipleGetResponse([[], [addressResponse]])
            .addAccuracyResponse(
              { ...addressRequestAccuracy, number: undefined },
              ADDRESS_ACCURACY.HIGH,
            )
            .addCreationResponse(
              { ...addressRequest, number: undefined, detail: 'Puerta 1' },
              addressResponse,
            )
            .build(),
          ...new DeliveryAreaResponsesBuilder()
            .addPostalCodeValidationResponse()
            .build(),
        ])
        .withLogin()
        .mount()

      await screen.findByText('Addresses', { selector: 'h1' })
      await fillManualAddressForm({
        address: 'Calle Arquitecto Mora',
        postal_code: '46010',
        town: 'València',
        address_detail: 'Puerta 1',
      })

      await screen.findByDisplayValue('46010')

      saveAddress()

      const alert = await screen.findByRole('dialog', {
        name: 'Address without street number',
      })
      confirmIncompleteErrorAlert()

      expect(alert).not.toBeInTheDocument()

      await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_incomplete_save_click',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
        },
      )
    })
  })

  describe('when address floor is empty', () => {
    it('should display an alert', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder().addEmptyResponse().build(),
        ])
        .withLogin()
        .mount()

      await screen.findByText('Addresses', { selector: 'h1' })
      await fillManualAddressForm({
        address: 'Calle Arquitecto Mora, 10',
        postal_code: '46010',
        town: 'València',
      })

      await screen.findByDisplayValue('46010')

      saveAddress()
      const alert = await screen.findByRole('dialog', {
        name: 'No floor or door number',
      })

      expect(alert).toHaveTextContent('No floor or door number')
      expect(alert).toHaveTextContent(
        'If your address includes a floor and door number, please add them for more information.',
      )
      expect(
        within(alert).getByRole('button', {
          name: 'Save',
        }),
      ).toBeInTheDocument()
      expect(
        within(alert).getByRole('button', { name: 'Add details' }),
      ).toBeInTheDocument()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_incomplete_view',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          street_number: '10',
          floor_door: 'incomplete',
          alert_origin: 'no_floor_door',
        },
      )
    })

    it('should focus to details input on click on alert update button', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder().addEmptyResponse().build(),
        ])
        .withLogin()
        .mount()

      await screen.findByText('Addresses', { selector: 'h1' })
      await fillManualAddressForm({
        address: 'Calle Arquitecto Mora, 10',
        postal_code: '46010',
        town: 'València',
      })

      await screen.findByDisplayValue('46010')

      saveAddress()
      const alert = await screen.findByRole('dialog', {
        name: 'No floor or door number',
      })

      userEvent.click(
        within(alert).getByRole('button', { name: 'Add details' }),
      )

      expect(alert).not.toBeInTheDocument()
      expect(
        screen.getByRole('textbox', { name: 'Floor, door...' }),
      ).toHaveFocus()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_incomplete_edit_click',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
        },
      )
    })

    it('should submit on save click', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder()
            .addMultipleGetResponse([[], [addressResponse]])
            .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.HIGH)
            .addCreationResponse(
              { ...addressRequest, detail: undefined },
              addressResponse,
            )
            .build(),
          ...new DeliveryAreaResponsesBuilder()
            .addPostalCodeValidationResponse()
            .build(),
        ])
        .withLogin()
        .mount()

      await screen.findByText('Addresses', { selector: 'h1' })
      await fillManualAddressForm({
        address: 'Calle Arquitecto Mora, 10',
        postal_code: '46010',
        town: 'València',
      })

      await screen.findByDisplayValue('46010')

      saveAddress()

      const alert = await screen.findByRole('dialog', {
        name: 'No floor or door number',
      })
      confirmIncompleteErrorAlert()

      expect(alert).not.toBeInTheDocument()

      await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_incomplete_save_click',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
        },
      )
    })
  })

  it('should send save click metric event form has an invalidation error', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder().addEmptyResponse().build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    await fillManualAddressForm({
      address: 'Calle Arquitecto Mora, 10',
      postal_code: '46010',
      town: 'València',
    })

    await screen.findByDisplayValue('46010')

    saveAddress()
    await screen.findByRole('dialog', {
      name: 'No floor or door number',
    })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'address_form_save_click',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        address_street_name: 'Calle Arquitecto Mora',
        address_street_number: '10',
        address_floor_door: undefined,
        address_zip_code: '46010',
        address_town: 'València',
        address_more_info: undefined,
        entered_manually: true,
      },
    )
  })

  describe('Address map validations', () => {
    it('should display the no service alert due a outside country exception invalidation', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder()
            .addMultipleGetResponse([[], [addressResponse]])
            .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.LOW)
            .addMapAddressReverse({
              street: 'Calle Arquitecto Mora',
              number: '10',
              postalCode: '46010',
              town: 'València',
              userFlow: 'map_cp',
            })
            .addValidationErrorResponse(
              CoordinatesOutsideAllowedCountryException,
              {
                latitude: 39.4756457,
                longitude: -0.3968569,
                postal_code: '46010',
              },
            )
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

      await screen.findByRole('dialog', {
        name: 'Indicate address',
      })
      const map = window.google.maps.Map()

      await idlePositionEvent(map)

      confirmAddressConfirmationModal()

      const alert = await screen.findByRole('dialog', {
        name: 'Without service',
      })

      expect(
        within(alert).getByAltText('no service country'),
      ).toBeInTheDocument()

      expect(alert).toHaveTextContent(
        'We are sorry, the address entered is outside of our delivery area',
      )
      expect(
        within(alert).getByRole('button', { name: 'OK' }),
      ).toBeInTheDocument()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_no_service_view',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          no_service_reason: 'country',
        },
      )
    })

    it('should display the no service alert due a exclusion exception invalidation', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder()
            .addMultipleGetResponse([[], [addressResponse]])
            .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.LOW)
            .addMapAddressReverse({
              street: 'Calle Arquitecto Mora',
              number: '10',
              postalCode: '46010',
              town: 'València',
              userFlow: 'map_cp',
            })
            .addValidationErrorResponse(AddressOutOfDeliveryException, {
              latitude: 39.4756457,
              longitude: -0.3968569,
              postal_code: '46010',
            })
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

      const map = window.google.maps.Map()
      await idlePositionEvent(map)

      confirmAddressConfirmationModal()

      const alert = await screen.findByRole('dialog', {
        name: 'Without service',
      })

      expect(
        within(alert).getByAltText('no service due to exclusion'),
      ).toBeInTheDocument()

      expect(alert).toHaveTextContent(
        'We are sorry, the address entered is outside of our delivery area',
      )
      expect(
        within(alert).getByRole('button', { name: 'OK' }),
      ).toBeInTheDocument()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_no_service_view',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          no_service_reason: 'exclusion',
        },
      )
    })

    it('should display the no service alert due a postal code exception invalidation', async () => {
      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder()
            .addMultipleGetResponse([[], [addressResponse]])
            .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.LOW)
            .addMapAddressReverse({
              street: 'Calle Arquitecto Mora',
              number: '10',
              postalCode: '46010',
              town: 'València',
              userFlow: 'map_cp',
            })
            .addValidationErrorResponse(PostalCodeWithoutServiceException, {
              latitude: 39.4756457,
              longitude: -0.3968569,
              postal_code: '46010',
            })
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

      const map = window.google.maps.Map()
      await idlePositionEvent(map)

      confirmAddressConfirmationModal()

      const alert = await screen.findByRole('dialog', {
        name: 'Postal code without service',
      })

      expect(
        within(alert).getByAltText('no service postal code'),
      ).toBeInTheDocument()

      expect(alert).toHaveTextContent(
        'The online service is not available in this address. You can use mercadona.es.',
      )
      expect(
        within(alert).getByRole('button', { name: 'OK' }),
      ).toBeInTheDocument()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_no_service_view',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          no_service_reason: 'postal_code',
        },
      )
    })

    it('should display the no service alert due a postal code exception invalidation without validate endpoint under flag', async () => {
      activeFeatureFlags([knownFeatureFlags.ADDRESS_POSTAL_CODE_CORRECTION])

      wrap(App)
        .atPath('/user-area/address')
        .withNetwork([
          ...new AddressResponsesBuilder()
            .addMultipleGetResponse([[], [addressResponse]])
            .addCreationErrorResponse(
              PostalCodeWithoutServiceException,
              addressRequest,
            )
            .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.HIGH)
            .build(),
          ...new DeliveryAreaResponsesBuilder()
            .addPostalCodeValidationResponse()
            .build(),
        ])
        .debugRequests()
        .withLogin()
        .mount()

      await screen.findByRole('heading', { name: 'Addresses' })
      await fillManualAddressForm(addressFormFill)
      await screen.findByDisplayValue('46010')
      saveAddress()

      await screen.findByRole('dialog', {
        name: 'Postal code without service',
      })

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_alert_no_service_view',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          no_service_reason: 'postal_code',
        },
      )
    })
  })
})
