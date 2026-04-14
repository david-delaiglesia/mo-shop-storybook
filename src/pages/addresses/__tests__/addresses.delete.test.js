import {
  screen,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'

import {
  cancelRemoveAddressAlert,
  confirmRemoveAddressAlert,
  removeAddressWhileIsBeingRemoved,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { App, history } from 'app'
import {
  addressResponse,
  secondaryAddressResponse,
} from 'app/address/__scenarios__/address'
import { clickElementDeleteButton } from 'pages/user-area/__tests__/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Addresses - Delete', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should display the delete address alert', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork(
        new AddressResponsesBuilder()
          .addGetResponse([addressResponse, secondaryAddressResponse])
          .build(),
      )
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    clickElementDeleteButton('Calle Arquitecto Mora, 10.')

    const alert = screen.getByRole('dialog', {
      name: 'Remove the delivery address. Are you sure you want to remove the delivery address?',
    })
    expect(alert).toHaveTextContent('Remove the delivery address')
    expect(alert).toHaveTextContent(
      'Are you sure you want to remove the delivery address?',
    )
    expect(
      within(alert).getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument()
    expect(
      within(alert).getByRole('button', { name: 'Remove' }),
    ).toBeInTheDocument()
  })

  it('should be able to close the delete address alert', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork(
        new AddressResponsesBuilder()
          .addGetResponse([addressResponse, secondaryAddressResponse])
          .build(),
      )
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    clickElementDeleteButton('Calle Arquitecto Mora, 10.')
    const alert = screen.getByRole('dialog', {
      name: 'Remove the delivery address. Are you sure you want to remove the delivery address?',
    })
    cancelRemoveAddressAlert()

    expect(alert).not.toBeInTheDocument()
  })

  it('should be possible to delete an address', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork(
        new AddressResponsesBuilder()
          .addMultipleGetResponse([
            [addressResponse, secondaryAddressResponse],
            [secondaryAddressResponse],
          ])
          .addDeleteResponse(addressResponse.id)
          .build(),
      )
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    clickElementDeleteButton('Calle Arquitecto Mora, 10.')
    confirmRemoveAddressAlert()

    expect(screen.getByLabelText('Loading')).toBeInTheDocument()

    await waitForElementToBeRemoved(() =>
      screen.getByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14'),
    )

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'delete_address_click',
      {
        address_id: 1,
        address_name: 'Calle Arquitecto Mora, 10 Piso 8 Puerta 14',
      },
    )
  })

  it('should block any interaction while removing an address', async () => {
    wrap(App)
      .atPath('/user-area/address')
      .withNetwork(
        new AddressResponsesBuilder()
          .addMultipleGetResponse([
            [addressResponse, secondaryAddressResponse],
            [secondaryAddressResponse],
          ])
          .addDeleteResponse(addressResponse.id)
          .build(),
      )
      .withLogin()
      .mount()

    await screen.findByText('Addresses', { selector: 'h1' })
    clickElementDeleteButton('Calle Arquitecto Mora, 10.')
    confirmRemoveAddressAlert()

    const alert = screen.getByRole('dialog', {
      name: 'Remove the delivery address. Are you sure you want to remove the delivery address?',
    })
    expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    expect(
      within(alert).queryByRole('button', { name: 'Remove' }),
    ).not.toBeInTheDocument()

    removeAddressWhileIsBeingRemoved()

    await waitForElementToBeRemoved(() =>
      screen.getByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14'),
    )

    expect(
      screen.queryByText('Calle Arquitecto Mora, 10. Piso 8 Puerta 14'),
    ).not.toBeInTheDocument()
  })
})
