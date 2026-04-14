import { screen, waitFor, within } from '@testing-library/react'

import { addCartToOngoingOrder, openCart } from './helpers'
import moment from 'moment'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cartWithOngoingOrder,
  expensiveCartRequest,
  mergedCartWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct,
  mergedCartWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct,
} from 'app/cart/__scenarios__/cart'
import { homeWithWidget } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { orderWithCustomSlotDate } from 'app/order/__scenarios__/orderDetail'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { getDay, getNumberDay, getStringMonthDay } from 'utils/dates'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Add to ongoing order Blinking Products - Modal', () => {
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

        const parsedNextMonday = getDay(nextMonday)

        wrap(App)
          .atPath('/')
          .withNetwork([
            { path: '/customers/1/home/', responseBody: homeWithWidget },
            {
              path: '/customers/1/orders/44051/cart/validate-merge/',
              method: 'post',
              requestBody: expensiveCartRequest,
              responseBody:
                mergedCartWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
                  nextTuesday,
                  nextMonday,
                ),
            },
            {
              path: '/customers/1/orders/44051/',
              responseBody: orderWithCustomSlotDate(parsedNextMonday),
            },
          ])
          .withLogin({ cart: cartWithOngoingOrder })
          .mount()

        await screen.findByText('Próxima entrega')
        openCart()
        await screen.findByText('Add to current order')
        addCartToOngoingOrder()

        const modal = await screen.findByRole('dialog')

        expect(modal).toBeInTheDocument()

        expect(modal).toHaveTextContent(`Not available on Monday`)
      })

      it('should show the message for 2 weekdays', async () => {
        const nextMonday = moment().add(1, 'weeks').day(1).toDate()
        const nextTuesday = moment().add(1, 'weeks').day(2).toDate()
        const nextWednesday = moment().add(1, 'weeks').day(3).toDate()

        const parsedNextMonday = getDay(nextMonday)

        wrap(App)
          .atPath('/')
          .withNetwork([
            { path: '/customers/1/home/', responseBody: homeWithWidget },
            {
              path: '/customers/1/orders/44051/cart/validate-merge/',
              method: 'post',
              requestBody: expensiveCartRequest,
              responseBody:
                mergedCartWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct(
                  nextWednesday,
                  [nextMonday, nextTuesday],
                ),
            },
            {
              path: '/customers/1/orders/44051/',
              responseBody: orderWithCustomSlotDate(parsedNextMonday),
            },
          ])
          .withLogin({ cart: cartWithOngoingOrder })
          .mount()

        await screen.findByText('Próxima entrega')
        openCart()
        await screen.findByText('Add to current order')
        addCartToOngoingOrder()

        const modal = await screen.findByRole('dialog')

        expect(modal).toBeInTheDocument()

        expect(modal).toHaveTextContent(`Not available on Monday, Tuesday`)
      })

      it('should show the message for 3 or more weekdays', async () => {
        const nextMonday = moment().add(1, 'weeks').day(1).toDate()
        const nextTuesday = moment().add(1, 'weeks').day(2).toDate()
        const nextWednesday = moment().add(1, 'weeks').day(3).toDate()

        const parsedNextMonday = getDay(nextMonday)

        wrap(App)
          .atPath('/')
          .withNetwork([
            { path: '/customers/1/home/', responseBody: homeWithWidget },
            {
              path: '/customers/1/orders/44051/cart/validate-merge/',
              method: 'post',
              requestBody: expensiveCartRequest,
              responseBody:
                mergedCartWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct(
                  nextWednesday,
                  [nextMonday, nextTuesday, nextWednesday],
                ),
            },
            {
              path: '/customers/1/orders/44051/',
              responseBody: orderWithCustomSlotDate(parsedNextMonday),
            },
          ])
          .withLogin({ cart: cartWithOngoingOrder })
          .mount()

        await screen.findByText('Próxima entrega')
        openCart()
        await screen.findByText('Add to current order')
        addCartToOngoingOrder()

        const modal = await screen.findByRole('dialog')

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

        const parsedTomorrow = getDay(tomorrow)

        wrap(App)
          .atPath('/')
          .withNetwork([
            { path: '/customers/1/home/', responseBody: homeWithWidget },
            {
              path: '/customers/1/orders/44051/cart/validate-merge/',
              method: 'post',
              requestBody: expensiveCartRequest,
              responseBody:
                mergedCartWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
                  tomorrow,
                  dayAfterTomorrow,
                ),
            },
            {
              path: '/customers/1/orders/44051/',
              responseBody: orderWithCustomSlotDate(parsedTomorrow),
            },
          ])
          .withLogin({ cart: cartWithOngoingOrder })
          .mount()

        await screen.findByText('Próxima entrega')
        openCart()
        await screen.findByText('Add to current order')
        addCartToOngoingOrder()

        const blinkingModal = await screen.findByRole('dialog')

        expect(blinkingModal).toBeInTheDocument()

        expect(
          within(blinkingModal).getByText(`Not available from ${month} ${day}`),
        ).toBeInTheDocument()
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
        const parsedTomorrow = getDay(tomorrow)

        wrap(App)
          .atPath('/')
          .withNetwork([
            { path: '/customers/1/home/', responseBody: homeWithWidget },
            {
              path: '/customers/1/orders/44051/cart/validate-merge/',
              method: 'post',
              requestBody: expensiveCartRequest,
              responseBody:
                mergedCartWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
                  tomorrow,
                  tomorrow,
                ),
            },
            {
              path: '/customers/1/orders/44051/',
              responseBody: orderWithCustomSlotDate(parsedTomorrow),
            },
          ])
          .withLogin({ cart: cartWithOngoingOrder })
          .mount()

        await screen.findByText('Próxima entrega')
        openCart()
        await screen.findByText('Add to current order')
        addCartToOngoingOrder()

        const blinkingModal = await screen.findByRole('dialog')

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

      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const parsedTomorrow = getDay(tomorrow)

      wrap(App)
        .atPath('/')
        .withNetwork([
          { path: '/customers/1/home/', responseBody: homeWithWidget },
          {
            path: '/customers/1/orders/44051/cart/validate-merge/',
            method: 'post',
            requestBody: expensiveCartRequest,
            responseBody:
              mergedCartWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
                dayAfterTomorrow,
                dayAfterTomorrow,
              ),
          },
          {
            path: '/customers/1/orders/44051/',
            responseBody: orderWithCustomSlotDate(parsedTomorrow),
          },
          { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
        ])
        .withLogin({ cart: cartWithOngoingOrder })
        .mount()

      await screen.findByText('Próxima entrega')

      openCart()
      await screen.findByText('Add to current order')
      addCartToOngoingOrder()

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })
  })
})
