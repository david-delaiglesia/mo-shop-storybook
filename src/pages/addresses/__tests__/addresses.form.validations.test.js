import { fireEvent, screen } from '@testing-library/react'

import { saveAddress } from './helpers'
import { vi } from 'vitest'
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
import { cookies } from 'app/cookie/__scenarios__/cookies'
import {
  fillManualAddressForm,
  typeManualAddressForm,
} from 'pages/__tests__/helper'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should be able to confirm the address if it has the required fields', async () => {
  const responses = [
    { path: '/customers/1/addresses/', responseBody: { results: [] } },
  ]

  wrap(App)
    .atPath('/user-area/address')
    .withNetwork(responses)
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'Addresses' })
  await fillManualAddressForm({
    address: 'Calle Colón',
    postal_code: '46010',
    town: 'València',
  })
  await screen.findByDisplayValue('46010')

  expect(screen.getByRole('button', { name: 'Save' })).not.toBeDisabled()
})

it('should display the save address button as disabled if there is no postal code', async () => {
  const responses = [
    { path: '/customers/1/addresses/', responseBody: { results: [] } },
  ]

  wrap(App)
    .atPath('/user-area/address')
    .withNetwork(responses)
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'Addresses' })
  await fillManualAddressForm({ address: 'Calle Colón', town: 'València' })

  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
})

it('should display the save address button as disabled if there is no town', async () => {
  const responses = [
    { path: '/customers/1/addresses/', responseBody: { results: [] } },
  ]

  wrap(App)
    .atPath('/user-area/address')
    .withNetwork(responses)
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'Addresses' })
  await fillManualAddressForm({ address: 'Calle Colón' })

  expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled()
})

it('should display the save address button as loading after confirm', async () => {
  wrap(App)
    .atPath('/user-area/address')
    .withNetwork([
      ...new AddressResponsesBuilder()
        .addMultipleGetResponse([[], [addressResponse]])
        .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.HIGH)
        .addCreationResponse(addressRequest, addressResponse)
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

  expect(screen.getByLabelText('loader')).toBeInTheDocument()
  await screen.findByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14')
})

describe('Postal code validations', () => {
  it('should show error message if the format is wrong', async () => {
    const responses = [
      { path: '/customers/1/addresses/', responseBody: { results: [] } },
    ]

    wrap(App)
      .atPath('/user-area/address')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm({ address: 'Calle Colón', postal_code: '0000' })

    const postalCodeField = screen.getByLabelText('Postal code')
    fireEvent.blur(postalCodeField)

    expect(
      await screen.findByText('The postcode is not correct'),
    ).toBeInTheDocument()
  })

  it('should not show error message if the format is wrong and the flag is not active', async () => {
    const responses = [
      { path: '/customers/1/addresses/', responseBody: { results: [] } },
    ]

    wrap(App)
      .atPath('/user-area/address')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm({ address: 'Calle Colón', postal_code: '0000' })

    expect(
      screen.queryByText('The postcode is not correct'),
    ).not.toBeInTheDocument()
  })
})

describe('Inputs max length', () => {
  it('should limit the max length in inputs', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder().addEmptyResponse().build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await typeManualAddressForm({
      address:
        'Avenida de la Constitución Urbanización Jardines del Prado Edificio Altavista Complejo Residencial Los Cipreses, 123456789012345',
      address_detail:
        'Piso 10, Puerta B, Planta Ático con vistas al parque central',
      postal_code: '12345678',
      town: 'Villa del Mar de los Sueños Inagotables en la Provincia del Sol Eterno y la Región de los Mil Paisajes',
      comments:
        'Este domicilio se encuentra en una zona residencial de alta seguridad, ideal para familias y profesionales. Cuenta con servicios cercanos como supermercados, hospitales, colegios, parques y centros comerciales. Además, el acceso a la red de transporte público es excelente.',
    })

    const expectedForm = {
      street:
        'Avenida de la Constitución Urbanización Jardines del Prado Edificio Altavista Complejo Residencial L',
      number: '1234567890',
      address_detail: 'Piso 10, Puerta B, Planta Ático con vist',
      postal_code: '12345',
      town: 'Villa del Mar de los Sueños Inagotables en la Provincia del Sol Eterno y la Región de',
      comments:
        'Este domicilio se encuentra en una zona residencial de alta seguridad, ideal para familias y profesionales. Cuenta con servicios cercanos como supermercados, hospitales, colegios, parques y centros comerciales. Además, el acceso a la red de transport',
    }

    expect(expectedForm.street).toHaveLength(100)
    expect(expectedForm.number).toHaveLength(10)
    expect(expectedForm.address_detail).toHaveLength(40)
    expect(expectedForm.postal_code).toHaveLength(5)
    expect(expectedForm.town).toHaveLength(85)
    expect(expectedForm.comments).toHaveLength(250)

    expect(screen.getByLabelText('Street name')).toHaveDisplayValue(
      expectedForm.street,
    )
    expect(screen.getByLabelText('Postal code')).toHaveDisplayValue(
      expectedForm.postal_code,
    )
    expect(screen.getByLabelText('Town/City')).toHaveDisplayValue(
      expectedForm.town,
    )
    expect(screen.getByLabelText('Floor, door...')).toHaveDisplayValue(
      expectedForm.address_detail,
    )
    expect(
      screen.getByLabelText('Additional information (E.g. There is no lift)'),
    ).toHaveDisplayValue(expectedForm.comments)
  }, 10000)
})
