import { screen } from '@testing-library/react'

import {
  cancelSlotsEdition,
  confirmSlot,
  selectFirstAvailableDay,
  selectSlot,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { address } from 'app/address/__scenarios__/address'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import {
  checkout,
  checkoutWithoutSlot,
} from 'app/checkout/__scenarios__/checkout'
import { SlotsMother } from 'app/delivery-area/__scenarios__/SlotsMother'
import { slots } from 'app/delivery-area/__scenarios__/slots'
import { clickToModifyDelivery } from 'pages/__tests__/helpers/checkout'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Delivery - Honeycomb', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should be able to see the new honeycomb slots layout with FF', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/orders/' },
      {
        path: '/customers/1/addresses/1/slots/',
        responseBody: SlotsMother.withHoneycombSlots(),
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
    )
    selectFirstAvailableDay()

    const slot = screen.getByRole('button', { name: 'From 11:00 to 13:00' })

    expect(slot).toBeInTheDocument()
  })

  it('should not be able to see the new honeycomb slots layout for standard slots', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/orders/' },
      { path: '/customers/1/addresses/1/slots/', responseBody: slots },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
    )
    selectFirstAvailableDay()
    const slot = screen.getByText('12:00 - 13:00 h')

    expect(slot).toBeInTheDocument()
    expect(slot).not.toHaveClass('slots-item-honeycomb')
  })

  it('should be able to select a slot', async () => {
    const honeycombSlots = SlotsMother.withHoneycombSlots()

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            {
              responseBody: CheckoutMother.withoutSlot(),
            },
            {
              responseBody: CheckoutMother.filled(),
            },
          ],
        },
        { path: '/customers/1/orders/' },
        {
          path: '/customers/1/addresses/1/slots/',
          responseBody: honeycombSlots,
        },
        {
          path: '/customers/1/checkouts/5/delivery-info/',
          requestBody: { address, slot: honeycombSlots.results[0] },
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

    selectSlot('From 11:00 to 13:00')
    confirmSlot()
    await screen.findByText(
      'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
    )

    expect(screen.getByText('from 08:00 to 09:00')).toBeInTheDocument()
    const expectedMetrics = {
      monthday: expect.stringMatching(/^\d{1,2}$/),
      time_range: expect.stringMatching(/^\d{1,2}:00 - \d{1,2}:00$/),
      weekday: expect.stringMatching(/^mon|tue|wed|thu|fri|sat|sun$/),
      centre_code: 'vlc1',
      slot_type: 2,
    }
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'slot_time_click',
      expectedMetrics,
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'slot_finished',
      expectedMetrics,
    )
  })

  it('should show slot as disabled when is closed', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/orders/' },
      {
        path: '/customers/1/addresses/1/slots/',
        responseBody: SlotsMother.withClosedHoneycombSlots(),
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
    )
    selectFirstAvailableDay()

    const slot = screen.getByRole('button', { name: 'From 11:00 to 13:00' })

    expect(slot).toBeDisabled()
    expect(slot).toHaveTextContent('Not available')
  })

  it('should show slot as disabled when is not available', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/orders/' },
      {
        path: '/customers/1/addresses/1/slots/',
        responseBody: SlotsMother.withCompletedHoneycombSlots(),
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
    )
    selectFirstAvailableDay()

    const slot = screen.getByRole('button', { name: 'From 11:00 to 13:00' })

    expect(slot).toBeDisabled()
    expect(slot).toHaveTextContent('Not available')
  })

  it('should show the slot duration for 1 hour slots', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      { path: '/customers/1/checkouts/5/', responseBody: checkoutWithoutSlot },
      { path: '/customers/1/orders/' },
      {
        path: '/customers/1/addresses/1/slots/',
        responseBody: SlotsMother.withHoneycombSlots(),
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText(
      'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
    )
    selectFirstAvailableDay()

    const defaultSlot = screen.getByRole('button', {
      name: 'From 11:00 to 13:00',
    })
    const oneHourSlot = screen.getByRole('button', {
      name: 'From 17:00 to 18:00',
    })
    expect(defaultSlot).toBeInTheDocument()
    expect(defaultSlot).not.toHaveTextContent('1 hour slot')
    expect(oneHourSlot).toBeInTheDocument()
    expect(oneHourSlot).toHaveTextContent('1 hour slot')
  })

  it('should show as selected the checkout slot', async () => {
    const honeycombSlots = SlotsMother.withHoneycombSlots()
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: {
          ...checkout,
          slot: honeycombSlots.results[0],
        },
      },
      { path: '/customers/1/orders/' },
      { path: '/customers/1/addresses/1/slots/', responseBody: honeycombSlots },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByRole('region', {
      name: 'Delivery',
    })
    await clickToModifyDelivery()
    await screen.findByText(
      'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
    )
    cancelSlotsEdition()
    await clickToModifyDelivery()
    await screen.findByText(
      'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
    )

    expect(
      screen.getByRole('button', { name: 'From 11:00 to 13:00' }),
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
