import { screen, waitFor } from '@testing-library/react'

import {
  fillPostalCodeField,
  removeLastCharacterFromTownField,
  removeLastCharacterFromValidPostalCodeField,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { fillManualAddressForm } from 'pages/__tests__/helper'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

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

describe('When postal code is not valid', () => {
  it('clears town field', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder().addEmptyResponse().build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm({ address: 'Fake street' })
    fillPostalCodeField('46009')
    removeLastCharacterFromValidPostalCodeField()

    expect(screen.getByLabelText('Town/City')).toHaveValue('')
  })
})

describe('When postal code is valid', () => {
  it('fills town', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addPostalCodeForward({ postalCode: '46004' }, { town: 'Barcelona' })
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm({ address: 'Fake street' })
    fillPostalCodeField('46004')

    await waitFor(() => {
      expect(screen.getByLabelText('Town/City')).toHaveValue('Barcelona')
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'manual_address_town_filled',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          zip_code: '46004',
          town: 'Barcelona',
        },
      )
    })
  })

  it('fails to fills town', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addPostalCodeForwardError({ postalCode: '46004' })
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm({ address: 'Fake street' })
    fillPostalCodeField('46004')

    await waitFor(() => {
      expect(screen.getByLabelText('Town/City')).toHaveValue('')
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'address_town_not_found_with_postal_code',
        {
          flow_id: '10000000-1000-4000-8000-100000000000',
          postal_code: '46004',
        },
      )
    })
  })
})

describe('When town is edited', () => {
  it('should send manual_address_town_edited metric', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork([
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addPostalCodeForward({ postalCode: '46004' })
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Addresses' })
    await fillManualAddressForm({ address: 'Fake street' })
    fillPostalCodeField('46004')

    await screen.findByDisplayValue('València')
    removeLastCharacterFromTownField()
    removeLastCharacterFromValidPostalCodeField()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'manual_address_town_edited',
      {
        flow_id: '10000000-1000-4000-8000-100000000000',
        zip_code: '46004',
        town: 'Valènci',
      },
    )
  })
})
