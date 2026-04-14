import { screen } from '@testing-library/react'

import MockDate from 'mockdate'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { address } from 'app/address/__scenarios__/address'
import { checkoutWithoutSlot } from 'app/checkout/__scenarios__/checkout'
import {
  slotsAllAvailableTomorrow,
  slotsMockDate,
  slotsNoneAvailable,
  slotsSomeAvailableDayAfterTomorrow,
} from 'app/delivery-area/__scenarios__/slots'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Slots - Event with information about the next available day with slots', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeAll(() => {
    MockDate.set(slotsMockDate)
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  afterAll(() => {
    MockDate.reset()
  })

  it('sends the correct data when the next available day is tomorrow', async () => {
    const responses = [
      { path: `/customers/1/orders/`, responseBody: { results: [] } },
      { path: `/customers/1/checkouts/5/`, responseBody: checkoutWithoutSlot },
      { path: `/customers/1/orders/` },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        responseBody: slotsAllAvailableTomorrow,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('slots_availability', {
      queue: 1,
      slots_first_day: 10,
      real_queue: 1,
      centre_code: 'vlc1',
    })
  })

  it('sends the correct data when the next available day is the day after tomorrow and some slots are available', async () => {
    const responses = [
      { path: `/customers/1/orders/`, responseBody: { results: [] } },
      { path: `/customers/1/checkouts/5/`, responseBody: checkoutWithoutSlot },
      { path: `/customers/1/orders/` },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        responseBody: slotsSomeAvailableDayAfterTomorrow,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('slots_availability', {
      queue: 3,
      slots_first_day: 2,
      real_queue: 2,
      centre_code: 'vlc1',
    })
  })

  it('sends the event with properties set to 0 when there are no days with available slots', async () => {
    const responses = [
      { path: `/customers/1/orders/`, responseBody: { results: [] } },
      { path: `/customers/1/checkouts/5/`, responseBody: checkoutWithoutSlot },
      { path: `/customers/1/orders/` },
      {
        path: `/customers/1/addresses/${address.id}/slots/`,
        responseBody: slotsNoneAvailable,
      },
      {
        path: '/customers/1/addresses/',
        responseBody: { results: [address] },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('slots_availability', {
      queue: -1,
      slots_first_day: 0,
      real_queue: -1,
      centre_code: 'vlc1',
    })
  })
})
