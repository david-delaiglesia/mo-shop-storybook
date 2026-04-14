import { screen } from '@testing-library/react'

import { confirmAddressForm } from './helpers'
import { configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { DeliveryAreaResponsesBuilder } from '__tests__/delivery-area/DeliveryAreaResponsesBuilder'
import { App, history } from 'app'
import { ADDRESS_ACCURACY } from 'app/address'
import {
  address,
  addressFormFill,
  addressRequest,
  addressRequestAccuracy,
  addressResponse,
} from 'app/address/__scenarios__/address'
import { checkoutWithoutAddress } from 'app/checkout/__scenarios__/checkout'
import { slotsMock } from 'containers/slots-container/__tests__/mocks'
import { fillManualAddressForm } from 'pages/__tests__/helper'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Delivery - Add a new address', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should add the address to the checkout', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithoutAddress,
        },
        { path: '/customers/1/addresses/1/slots/', responseBody: slotsMock },

        { path: '/customers/1/orders/' },
        ...new AddressResponsesBuilder()
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.HIGH)
          .addCreationResponse(addressRequest, addressResponse)
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    await fillManualAddressForm(addressFormFill)
    await screen.findByDisplayValue('46010')
    confirmAddressForm()
    await screen.findByText('Change address')

    expect(
      screen.queryByText('Add where you want to receive your order.'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText(
        'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
      ),
    ).toBeInTheDocument()
  })

  it('should goes to home when the user cancel address and has not address', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: checkoutWithoutAddress,
      },
      { path: '/postal-codes/actions/retrieve-pc/46010/', status: 204 },
      { path: '/customers/1/addresses/1/slots/', responseBody: slotsMock },
      {
        path: '/customers/1/addresses/',
        requestBody: addressRequest,
        responseBody: address,
        method: 'post',
      },
      { path: '/customers/1/orders/' },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')
    expect(
      screen.queryByRole('button', { name: 'Cancel' }),
    ).not.toBeInTheDocument()
  })
})
