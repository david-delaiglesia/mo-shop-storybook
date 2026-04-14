import { screen, within } from '@testing-library/react'

import {
  slotsMock,
  slotsMockForTwoWeeks,
} from '../../../containers/slots-container/__tests__/mocks'
import { getNumberDay, getStringMonthDay } from '../../../utils/dates'
import { selectDeliveryDate } from './helpers'
import moment from 'moment'
import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app.jsx'
import { address } from 'app/address/__scenarios__/address'
import {
  checkoutWithoutSlotWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct,
  checkoutWithoutSlotWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct,
} from 'app/checkout/__scenarios__/checkout'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Delivery - Blinking Products - Modal', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    moment.locale('en')
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  describe('When the user has a blinking product in the cart', () => {
    describe('when the product is only unavailable because of the weekdays', () => {
      it('should show the modal with unavailable weekdays message', async () => {
        const nextMonday = moment().add(1, 'weeks').day(1).toDate()
        const nextTuesday = moment().add(1, 'weeks').day(2).toDate()

        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody:
                checkoutWithoutSlotWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
                  nextTuesday,
                  nextMonday,
                ),
            },
            {
              path: '/customers/1/addresses/1/slots/',
              responseBody: slotsMockForTwoWeeks,
            },
            {
              path: '/customers/1/addresses/',
              responseBody: { results: [address] },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Delivery')

        selectDeliveryDate(nextMonday.getDate())

        const modal = screen.queryByRole('dialog')

        expect(modal).toBeInTheDocument()

        expect(modal).toHaveTextContent(`Not available on Monday`)
      })

      it('should show the message for 2 weekdays', async () => {
        const nextMonday = moment().add(1, 'weeks').day(1).toDate()
        const nextTuesday = moment().add(1, 'weeks').day(2).toDate()
        const nextWednesday = moment().add(1, 'weeks').day(3).toDate()

        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody:
                checkoutWithoutSlotWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct(
                  nextWednesday,
                  [nextMonday, nextTuesday],
                ),
            },
            {
              path: '/customers/1/addresses/1/slots/',
              responseBody: slotsMockForTwoWeeks,
            },
            {
              path: '/customers/1/addresses/',
              responseBody: { results: [address] },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Delivery')

        selectDeliveryDate(nextMonday.getDate())

        const modal = screen.queryByRole('dialog')

        expect(modal).toBeInTheDocument()

        expect(modal).toHaveTextContent(`Not available on Monday, Tuesday`)
      })

      it('should show the message for 3 or more weekdays', async () => {
        const nextMonday = moment().add(1, 'weeks').day(1).toDate()
        const nextTuesday = moment().add(1, 'weeks').day(2).toDate()
        const nextWednesday = moment().add(1, 'weeks').day(3).toDate()

        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody:
                checkoutWithoutSlotWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct(
                  nextWednesday,
                  [nextMonday, nextTuesday, nextWednesday],
                ),
            },
            {
              path: '/customers/1/addresses/1/slots/',
              responseBody: slotsMockForTwoWeeks,
            },
            {
              path: '/customers/1/addresses/',
              responseBody: { results: [address] },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Delivery')

        selectDeliveryDate(nextMonday.getDate())

        const modal = screen.queryByRole('dialog')

        expect(modal).toBeInTheDocument()

        expect(modal).toHaveTextContent(
          `Only available on Thursday, Friday, Saturday`,
        )
      })
    })

    describe('when the product is only unavailable because of the unavailable from date', () => {
      it('should show the modal with unavailable from date', async () => {
        const today = new Date()
        const tomorrow = new Date(today)
        const dayAfterTomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

        const month = getStringMonthDay(tomorrow)
        const day = getNumberDay(tomorrow)

        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody:
                checkoutWithoutSlotWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
                  tomorrow,
                  dayAfterTomorrow,
                ),
            },
            {
              path: '/customers/1/addresses/1/slots/',
              responseBody: slotsMock,
            },
            {
              path: '/customers/1/addresses/',
              responseBody: { results: [address] },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Delivery')

        selectDeliveryDate(tomorrow.getDate())

        const blinkingModal = screen.queryByRole('dialog')

        expect(blinkingModal).toBeInTheDocument()

        expect(
          within(blinkingModal).getByText(`Not available from ${month} ${day}`),
        ).toBeInTheDocument()
      })

      it('should not display the days of the week in the modal', async () => {
        const today = new Date()
        const tomorrow = new Date(today)
        const dayAfterTomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody:
                checkoutWithoutSlotWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
                  tomorrow,
                  dayAfterTomorrow,
                ),
            },
            {
              path: '/customers/1/addresses/1/slots/',
              responseBody: slotsMock,
            },
            {
              path: '/customers/1/addresses/',
              responseBody: { results: [address] },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Delivery')

        selectDeliveryDate(tomorrow.getDate())

        const blinkingModal = screen.queryByRole('dialog')

        const monday = within(blinkingModal).queryByText('M')
        const tuesday = within(blinkingModal).queryByText('TU')
        const wednesday = within(blinkingModal).queryByText('W')
        const thursday = within(blinkingModal).queryByText('T')
        const friday = within(blinkingModal).queryByText('F')
        const saturday = within(blinkingModal).queryByText('S')

        expect(monday).not.toBeInTheDocument()
        expect(tuesday).not.toBeInTheDocument()
        expect(wednesday).not.toBeInTheDocument()
        expect(thursday).not.toBeInTheDocument()
        expect(friday).not.toBeInTheDocument()
        expect(saturday).not.toBeInTheDocument()
      })
    })

    describe('when the product is unavailable because of the weekdays and the unavailable from date', () => {
      it('should show the modal with unavailable from date', async () => {
        const today = new Date()
        const tomorrow = new Date(today)
        const dayAfterTomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

        const month = getStringMonthDay(tomorrow)
        const day = getNumberDay(tomorrow)

        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody:
                checkoutWithoutSlotWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
                  tomorrow,
                  tomorrow,
                ),
            },
            {
              path: '/customers/1/addresses/1/slots/',
              responseBody: slotsMock,
            },
            {
              path: '/customers/1/addresses/',
              responseBody: { results: [address] },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Delivery')

        selectDeliveryDate(tomorrow.getDate())

        const blinkingModal = screen.queryByRole('dialog')

        expect(blinkingModal).toBeInTheDocument()

        expect(
          within(blinkingModal).getByText(`Not available from ${month} ${day}`),
        ).toBeInTheDocument()
      })
    })
  })

  describe('When the user has no blinking product in the cart', () => {
    it('should not show the modal', async () => {
      const today = new Date()
      const tomorrow = new Date(today)
      const dayAfterTomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody:
              checkoutWithoutSlotWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
                dayAfterTomorrow,
                dayAfterTomorrow,
              ),
          },
          {
            path: '/customers/1/addresses/1/slots/',
            responseBody: slotsMock,
          },
          {
            path: '/customers/1/addresses/',
            responseBody: { results: [address] },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Delivery')

      selectDeliveryDate(tomorrow.getDate())

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
