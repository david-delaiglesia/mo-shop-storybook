import { screen, within } from '@testing-library/react'

import * as UseFlowIdGeneratorHook from '../../../app/shared/flow-id/useFlowIdGenerator'
import { openAddressForm, saveAddress, saveAddressWithEnter } from './helpers'
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
  secondaryAddressResponse,
} from 'app/address/__scenarios__/address'
import {
  fillManualAddressForm,
  openNewAddressForm,
} from 'pages/__tests__/helper'
import { clickElementDefaultButton } from 'pages/user-area/__tests__/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User area - Addresses', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should see CTA if there are no address', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder().addEmptyResponse().build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })

    const ctaContent = screen.getByLabelText('There is no address')

    expect(
      within(ctaContent).getByRole('img', { name: 'There is no address' }),
    ).toBeInTheDocument()
    expect(
      within(ctaContent).getByText('There is no address'),
    ).toBeInTheDocument()
    expect(
      within(ctaContent).getByText('Add where you want to receive your order.'),
    ).toBeInTheDocument()
    expect(
      within(ctaContent).getByRole('button', { name: 'Add address' }),
    ).toBeInTheDocument()

    expect(Tracker.sendViewChange).toHaveBeenCalledWith('addresses')
  })

  it('should show new address form on click to empty CTA if there are no address', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder().addEmptyResponse().build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })

    openNewAddressForm()

    expect(
      screen.getByText('Add where you want to receive your order.'),
    ).toBeInTheDocument()
  })

  it('should be able to save a new address', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([[], [addressResponse]])
          .addCreationResponse(addressRequest, addressResponse)
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.HIGH)
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    openNewAddressForm()
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    saveAddress()
    const addedAddressCard = await screen.findByText(
      'Calle Arquitecto Mora, 10. Piso 8 Puerta 14',
    )
    const addressFormTitle = screen.queryByText(
      'Add where you want to receive your order.',
    )

    expect(addedAddressCard).toBeInTheDocument()
    expect(addressFormTitle).not.toBeInTheDocument()
  })

  it('should be able to generate each flow id for address to save', async () => {
    vi.spyOn(UseFlowIdGeneratorHook, 'useFlowIdGenerator')
      .mockReturnValueOnce('uuid1')
      .mockReturnValueOnce('uuid2')

    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([
            [],
            [addressResponse],
            [addressResponse, secondaryAddressResponse],
          ])
          .addCreationResponse(
            {
              ...addressRequest,
              flow_id: 'uuid1',
            },
            addressResponse,
          )
          .addCreationResponse(
            {
              ...addressRequest,
              flow_id: 'uuid2',
            },
            addressResponse,
          )
          .addAccuracyResponse(
            { ...addressRequestAccuracy, flowId: 'uuid1' },
            ADDRESS_ACCURACY.HIGH,
          )
          .addAccuracyResponse(
            { ...addressRequestAccuracy, flowId: 'uuid2' },
            ADDRESS_ACCURACY.HIGH,
          )
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    openNewAddressForm()
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    saveAddress()
    await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')
    openAddressForm()
    await screen.findByText('Add where you want to receive your order.')
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    saveAddress()
    await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')

    expect('/customers/1/address/').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        ...addressRequest,
        flow_id: 'uuid1',
      },
    })
    expect('/customers/1/address/').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        ...addressRequest,
        flow_id: 'uuid2',
      },
    })
    expect('/customers/1/address/').toHaveBeenFetchedTimes(2)
  })

  it('should be able to save a new address with the ENTER key', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([[], [addressResponse]])
          .addCreationResponse(addressRequest, addressResponse)
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.HIGH)
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    openNewAddressForm()
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    saveAddressWithEnter()
    const addedAddressCard = await screen.findByText(
      'Calle Arquitecto Mora, 10. Piso 8 Puerta 14',
    )
    const addressFormTitle = screen.queryByText(
      'Add where you want to receive your order.',
    )

    expect(addedAddressCard).toBeInTheDocument()
    expect(addressFormTitle).not.toBeInTheDocument()
  })

  it('should not be possible to close the address form while a new address is being saved', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([
            [secondaryAddressResponse],
            [secondaryAddressResponse, addressResponse],
          ])
          .addCreationResponse(addressRequest, addressResponse)
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.HIGH)
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Calle Colón, 10. Piso 8 Puerta 14')
    openAddressForm()
    await screen.findByText('Add where you want to receive your order.')
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    saveAddress()

    expect(screen.getByRole('button', { name: 'Go back' })).toBeDisabled()
    expect(screen.getByLabelText('loader')).toBeInTheDocument()

    await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')

    const [recentlySavedAddress] = within(
      screen.getByTestId('address-list'),
    ).getAllByRole('listitem')
    expect(recentlySavedAddress).toHaveTextContent('Calle Arquitecto Mora, 10')
  })

  it('should allow to set an address as default', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addMultipleGetResponse([
            [addressResponse, secondaryAddressResponse],
            [
              { ...secondaryAddressResponse, permanent_address: true },
              { ...addressResponse, permanent_address: false },
            ],
          ])
          .build(),
        {
          path: `/customers/1/addresses/${addressResponse.id}/make_default/`,
          method: 'patch',
          responseBody: addressResponse,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')
    clickElementDefaultButton('Calle Colón, 10. Piso 8 Puerta 14')
    await screen.findByText('Calle Colón, 10. Piso 8 Puerta 14')
    const permanentAddressCard = screen
      .getByText('Calle Colón, 10. Piso 8 Puerta 14')
      .closest('li')

    expect(permanentAddressCard).not.toHaveTextContent('Select')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'make_default_address_click',
      {
        address_id: 2,
        address_name: 'Calle Colón, 10 Piso 8 Puerta 14',
      },
    )
  })
})
