import { screen, within } from '@testing-library/react'

import {
  confirmAddressList,
  confirmSlot,
  editAddress,
  selectAddress,
  selectAndConfirmFirstSlot,
  selectDeliveryDate,
  selectFirstAvailableDay,
  selectFirstSlot,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  address,
  addressFromDifferentWarehouse,
  secondaryAddress,
} from 'app/address/__scenarios__/address'
import { mockedAddresses } from 'app/address/__tests__/addresses.mock'
import { cartWithOneUnpublishedProduct } from 'app/cart/__scenarios__/cart'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import {
  checkout,
  checkoutWithAddressConfirmationRequired,
  checkoutWithoutAddress,
  checkoutWithoutSlot,
} from 'app/checkout/__scenarios__/checkout'
import {
  emptySlots,
  notAvailableSlots,
  slotForFurtherWeek,
  slotsHolidaysTomorrowMock,
  slotsMock,
  slotsUnavailableTomorrowMock,
} from 'containers/slots-container/__tests__/mocks'
import { clickToModifyDelivery } from 'pages/__tests__/helpers/checkout'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'
import { getLongDayName, getNumberDay } from 'utils/dates'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Delivery', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should display the proper slot info when select an available day', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/orders/' },
      {
        path: '/customers/1/addresses/1/slots/',
        responseBody: slotsUnavailableTomorrowMock,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextAvailableDay = new Date(tomorrow)
    nextAvailableDay.setDate(nextAvailableDay.getDate() + 1)
    await screen.findByText('Delivery')
    selectFirstAvailableDay()

    const dayNumber = getNumberDay(nextAvailableDay)
    const dayName = getLongDayName(nextAvailableDay)

    expect(
      await screen.findByText(`Slots for ${dayName} ${dayNumber}`),
    ).toBeInTheDocument()
    expect(
      screen.getByText(
        'Choose a slot and confirm to proceed with the purchase',
      ),
    ).toBeInTheDocument()
  })

  it('should not be able to select a day without available slots', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/orders/' },
      {
        path: '/customers/1/addresses/1/slots/',
        responseBody: slotsUnavailableTomorrowMock,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextAvailableDay = new Date(tomorrow)
    nextAvailableDay.setDate(nextAvailableDay.getDate() + 1)
    await screen.findByText('Delivery')
    selectFirstAvailableDay()
    selectDeliveryDate(tomorrow.getDate())

    const dayNumber = getNumberDay(nextAvailableDay)
    const dayName = getLongDayName(nextAvailableDay)

    expect(
      await screen.findByText(`Slots for ${dayName} ${dayNumber}`),
    ).toBeInTheDocument()
  })

  it('should be able to select a slot', async () => {
    const selectedSlot = slotsMock.results[1]
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            {
              responseBody: CheckoutMother.withoutSlot(),
            },
            {
              responseBody: {
                ...CheckoutMother.filled(),
                slot: {
                  ...CheckoutMother.filled().slot,
                  start: '2017-11-10T11:00:00Z',
                  end: '2017-11-10T12:00:00Z',
                },
              },
            },
          ],
        },
        { path: '/customers/1/orders/' },
        { path: '/customers/1/addresses/1/slots/', responseBody: slotsMock },
        {
          path: '/customers/1/checkouts/5/delivery-info/',
          requestBody: { address, slot: selectedSlot },
          method: 'put',
        },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText(
      'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
    )
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()
    await screen.findByText(
      'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
    )

    expect(screen.getByText('from 12:00 to 13:00')).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('delivery_view')
    const expectedMetrics = {
      monthday: expect.stringMatching(/^\d{1,2}$/),
      time_range: expect.stringMatching(/^\d{1,2}:00 - \d{1,2}:00$/),
      weekday: expect.stringMatching(/^mon|tue|wed|thu|fri|sat|sun$/),
      slot_type: 0,
      centre_code: 'vlc1',
    }
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('slot_day_click', {
      monthday: expect.stringMatching(/^\d{1,2}$/),
      weekday: expect.stringMatching(/^mon|tue|wed|thu|fri|sat|sun$/),
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'slot_time_click',
      expectedMetrics,
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'slot_finished',
      expectedMetrics,
    )
  })

  it('should deselect the slot if it is not available for a checkout without slot', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/addresses/1/slots/', responseBody: slotsMock },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
      {
        path: '/customers/1/checkouts/5/delivery-info/',
        requestBody: { address: checkout.address, slot: slotsMock.results[1] },
        method: 'put',
        status: 400,
        responseBody: {
          errors: [
            {
              detail:
                'El horario seleccionado no está disponible. Inténtalo de nuevo',
              code: 'stol_taken',
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    await screen.findByText('Pick a day for 46010')
    selectFirstAvailableDay()
    selectFirstSlot()
    confirmSlot()
    await screen.findByRole('dialog')

    const selectedSlotButton = screen.getByText(/14:00/).closest('button')
    expect(selectedSlotButton).toHaveClass('slots-item')
    expect(selectedSlotButton).not.toHaveClass('slots-item--selected')
  })

  it('should change the slot selecting new slot', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/addresses/1/slots/', responseBody: slotsMock },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    await screen.findByText('Delivery')

    selectFirstAvailableDay()
    selectFirstSlot()

    const slotsGroup = screen.getByRole('group', {
      name: 'Choose a slot and confirm to proceed with the purchase',
    })

    const [firstSlot] = within(slotsGroup).getAllByRole('button')
    expect(firstSlot).toHaveAttribute('aria-pressed', 'true')
  })

  it('should not able to select a bank holiday', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      {
        path: '/customers/1/addresses/1/slots/',
        responseBody: slotsHolidaysTomorrowMock,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextAvailableDay = new Date(tomorrow)
    nextAvailableDay.setDate(nextAvailableDay.getDate() + 1)

    await screen.findByText('Pick a day for 46010')
    selectFirstAvailableDay()
    selectDeliveryDate(tomorrow.getDate())
    const dayNumber = getNumberDay(nextAvailableDay)
    const dayName = getLongDayName(nextAvailableDay)

    expect(
      await screen.findByText(`Slots for ${dayName} ${dayNumber}`),
    ).toBeInTheDocument()
  })

  it('should show an error when selecting a slot from a different warehouse', async () => {
    const [firstAddress, secondAddress] = mockedAddresses.results
    const differentWarehouseAddress = { ...firstAddress, postal_code: '08040' }
    const addressNotInWarehouseError = {
      code: 'address_not_in_warehouse',
      detail:
        'No es posible cambiar la dirección a la de otra provincia.' +
        'Para cambiar la dirección, ve a tu perfil y selecciona la nueva dirección antes de tramitar tu pedido',
    }
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkout },
      { path: '/customers/1/addresses/1/slots/', responseBody: slotsMock },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [differentWarehouseAddress, secondAddress] },
      },
      {
        path: `/customers/1/addresses/${differentWarehouseAddress.id}/slots/`,
        responseBody: slotsMock,
      },
      {
        path: '/customers/1/checkouts/5/delivery-info/',
        requestBody: {
          address: differentWarehouseAddress,
          slot: slotsMock.results[1],
        },
        method: 'put',
        status: 400,
        responseBody: { errors: [addressNotInWarehouseError] },
      },
      { path: '/customers/1/orders/' },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await clickToModifyDelivery()
    await editAddress(differentWarehouseAddress.address)
    await screen.findByText('Checkout')
    selectFirstAvailableDay()
    selectAndConfirmFirstSlot()
    await screen.findByText('Checkout')

    expect(
      screen.getByText(addressNotInWarehouseError.detail),
    ).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_delivery_click',
      { purchase_id: 5 },
    )
  })

  it('should see the placeholder when there are empty slots', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/addresses/1/slots/', responseBody: emptySlots },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    const image = await screen.findByAltText('warning')

    expect(image).toBeInTheDocument()
    expect(screen.getByText('There are no slots available')).toBeInTheDocument()
    expect(
      screen.getByText('Please contact customer service.'),
    ).toBeInTheDocument()
  })

  it('should see the placeholder when there are not available slots', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      {
        path: '/customers/1/addresses/1/slots/',
        responseBody: notAvailableSlots,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    const image = await screen.findByAltText('warning')

    expect(image).toBeInTheDocument()
    expect(screen.getByText('There are no slots available')).toBeInTheDocument()
    expect(
      screen.getByText('Please contact customer service.'),
    ).toBeInTheDocument()
  })

  it('should confirm the address when requires confirmation', async () => {
    const responses = [
      {
        path: '/customers/1/checkouts/5/',
        responseBody: checkoutWithAddressConfirmationRequired,
      },
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address, secondaryAddress] },
      },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        responseBody: slotsMock,
      },
      {
        path: `/customers/1/addresses/${secondaryAddress.id}/slots/`,
        responseBody: slotsMock,
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery address for this order')

    selectAddress(secondaryAddress.address)
    confirmAddressList()

    await screen.findByText(
      'Calle Colón, 10, Piso 8 Puerta 14, 46010, València',
    )

    expect(Tracker.sendViewChange).toHaveBeenCalledWith('address_confirmation')
  })

  it('should allow to choose an address from the list', async () => {
    const responses = [
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address, secondaryAddress] },
      },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        responseBody: slotsMock,
      },
      {
        path: `/customers/1/addresses/${secondaryAddress.id}/slots/`,
        responseBody: slotsMock,
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Calle Colón, 10')
    selectAddress(secondaryAddress.address)
    confirmAddressList()
    await screen.findByText(
      'Calle Colón, 10, Piso 8 Puerta 14, 46010, València',
    )

    expect(
      screen.queryByText(
        'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
      ),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Calle Colón, 10, Piso 8 Puerta 14, 46010, València'),
    ).toBeInTheDocument()
  })

  it('should allow to choose an address from the list and show the changeOfAddress modal', async () => {
    const responses = [
      {
        path: '/customers/1/checkouts/5/?lang=es&wh=vlc1',
        responseBody: checkoutWithAddressConfirmationRequired,
      },
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/addresses/?lang=es&wh=vlc1',
        responseBody: { results: [address, addressFromDifferentWarehouse] },
      },
      {
        path: `/customers/1/addresses/${address.id}/slots/?lang=es&wh=vlc1`,
        responseBody: slotsMock,
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/slots/?lang=es&wh=vlc1`,
        responseBody: slotsMock,
      },
      {
        path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=es&wh=vlc1`,
        method: 'patch',
        responseBody: {
          results: addressFromDifferentWarehouse,
        },
        headers: { 'x-customer-pc': '28001', 'x-customer-wh': 'mad1' },
      },
      {
        path: `/customers/1/cart/?lang=en&wh=mad1`,
        responseBody: cartWithOneUnpublishedProduct,
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Calle Arquitecto Mora, 10')

    await screen.findByText('Calle Mayor, 10')

    selectAddress(addressFromDifferentWarehouse.address)
    confirmAddressList()

    expect(await screen.findByText('Change of address')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Availability may vary if the address is changed. Process the order again.',
      ),
    ).toBeInTheDocument()
  })

  it('should show days alert banner when first available day is further or equal to 7 days', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        responseBody: slotForFurtherWeek,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    await screen.findByText('Delivery')
    selectFirstAvailableDay()

    const daysDisclaimer = screen.getByRole('mark', {
      name: '7 days left for this delivery',
    })

    expect(daysDisclaimer).toBeInTheDocument()
  })

  it('should not show days alert banner when first available day is closer than 7 days', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        responseBody: slotsMock,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')

    selectFirstAvailableDay()

    expect(
      screen.queryByText('1 days left for this delivery'),
    ).not.toBeInTheDocument()
  })

  describe('when FF is active', () => {
    describe('and has multiple addresses', () => {
      it('should not have any address selected', async () => {
        const responses = [
          {
            path: '/customers/1/checkouts/5/',
            responseBody: checkoutWithAddressConfirmationRequired,
          },
          { path: '/customers/1/orders/', responseBody: { results: [] } },
          {
            path: '/customers/1/addresses/',
            responseBody: { results: [address, secondaryAddress] },
          },
          {
            path: `/customers/1/addresses/${secondaryAddress.id}/slots/`,
            responseBody: slotsMock,
          },
        ]
        wrap(App)
          .atPath('/checkout/5')
          .withNetwork(responses)
          .withLogin()
          .mount()

        await screen.findByText('Delivery')

        expect(
          screen.queryByTestId('address-picker-selected'),
        ).not.toBeInTheDocument()

        expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
      })
    })

    describe('and has only one address', () => {
      it('should have the default address selected', async () => {
        const responses = [
          {
            path: '/customers/1/checkouts/5/',
            responseBody: {
              ...checkoutWithAddressConfirmationRequired,
              requires_address_confirmation: false,
            },
          },
          { path: '/customers/1/orders/', responseBody: { results: [] } },
          {
            path: '/customers/1/addresses/',
            responseBody: { results: [address] },
          },
          {
            path: `/customers/1/addresses/${address.id}/slots/`,
            responseBody: slotsMock,
          },
        ]
        wrap(App)
          .atPath('/checkout/5')
          .withNetwork(responses)
          .withLogin()
          .mount()

        await screen.findByText('Delivery')

        expect(
          await screen.findByText(/Calle Arquitecto Mora, 10/i),
        ).toBeInTheDocument()

        expect(await screen.findByText(/Change address/i)).toBeInTheDocument()
      })

      describe('and checkout does not have an address', () => {
        it('should have the default address selected', async () => {
          const responses = [
            {
              path: '/customers/1/checkouts/5/',
              responseBody: {
                ...checkoutWithAddressConfirmationRequired,
                requires_address_confirmation: false,
                address: null,
              },
            },
            { path: '/customers/1/orders/', responseBody: { results: [] } },
            {
              path: '/customers/1/addresses/',
              responseBody: { results: [address] },
            },
            {
              path: `/customers/1/addresses/${address.id}/slots/`,
              responseBody: slotsMock,
            },
          ]
          wrap(App)
            .atPath('/checkout/5')
            .withNetwork(responses)
            .withLogin()
            .mount()

          await screen.findByText('Delivery')

          expect(
            await screen.findByText(/Calle Arquitecto Mora, 10/i),
          ).toBeInTheDocument()

          expect(await screen.findByText(/Change address/i)).toBeInTheDocument()
        })
      })
    })

    describe('and does not have any address', () => {
      it('should display create Address form', async () => {
        const responses = [
          {
            path: '/customers/1/checkouts/5/',
            responseBody: {
              ...checkoutWithoutAddress,
              address: null,
            },
          },
          { path: '/customers/1/orders/', responseBody: { results: [] } },
          {
            path: '/customers/1/addresses/',
            responseBody: { results: [] },
          },
        ]
        wrap(App)
          .atPath('/checkout/5')
          .withNetwork(responses)
          .withLogin()
          .mount()

        await screen.findByText('Delivery')

        expect(await screen.findByLabelText(/street/i)).toBeInTheDocument()
      })
    })

    it('should continue checkout flow', async () => {
      const responses = [
        {
          path: '/customers/1/checkouts/5/',
          responseBody: checkoutWithAddressConfirmationRequired,
        },
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/addresses/',
          responseBody: { results: [address, secondaryAddress] },
        },
        {
          path: `/customers/1/addresses/${secondaryAddress.id}/slots/`,
          responseBody: slotsMock,
        },
      ]
      wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

      await screen.findByText('Delivery')

      selectAddress(secondaryAddress.address)
      confirmAddressList()

      expect(
        await screen.findByText(
          'Calle Colón, 10, Piso 8 Puerta 14, 46010, València',
        ),
      ).toBeInTheDocument()
    })
  })
})
