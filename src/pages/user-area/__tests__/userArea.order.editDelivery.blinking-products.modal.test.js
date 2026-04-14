import { screen, within } from '@testing-library/react'

import {
  slotsMock,
  slotsMockForTwoWeeks,
} from '../../../containers/slots-container/__tests__/mocks'
import {
  getLongDayName,
  getNumberDay,
  getStringMonthDay,
} from '../../../utils/dates'
import { selectDeliveryDate } from './helpers'
import moment from 'moment'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { address } from 'app/address/__scenarios__/address'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import {
  order,
  preparedLinesWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct,
  preparedLinesWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct,
} from 'app/order/__scenarios__/orderDetail'
import { clickToModifyDelivery } from 'pages/__tests__/helpers/checkout'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Order - Edit Delivery ', () => {
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
        const selectedSlot = slotsMock.results[0]

        const nextMonday = moment().add(1, 'weeks').day(1).toDate()
        const nextTuesday = moment().add(1, 'weeks').day(2).toDate()

        const dayToSelectNumber = getNumberDay(nextMonday)
        const dayToSelectLongName = getLongDayName(nextMonday)

        const responses = [
          {
            path: `/customers/1/orders/44051/`,
            responseBody: {
              ...order,
              address,
              slot: selectedSlot,
              start_date: selectedSlot.start,
            },
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody:
              preparedLinesWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
                nextTuesday,
                nextMonday,
              ),
          },
          {
            path: `/customers/1/addresses/`,
            responseBody: {
              results: [address],
            },
          },
          {
            path: `/customers/1/addresses/${address.id}/slots/`,
            multipleResponses: [{ responseBody: slotsMockForTwoWeeks }],
          },
          {
            path: '/customers/1/orders/44051/remove-lines/',
            method: 'post',
            requestBody: {
              product_ids: ['8731'],
            },
            responseBody: {
              ...order,
              address,
              slot: selectedSlot,
              start_date: selectedSlot.start,
              summary: {
                ...order.summary,
                total: '55.55',
              },
            },
          },
        ]
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork(responses)
          .withLogin()
          .mount()

        await screen.findByText('70,96 €')
        await clickToModifyDelivery()
        await screen.findByText(`Pick a day for ${address.postal_code}`)

        selectDeliveryDate(`${dayToSelectLongName}, ${dayToSelectNumber}`)

        const modal = screen.queryByRole('dialog')

        expect(modal).toBeInTheDocument()

        expect(modal).toHaveTextContent(`Not available on Monday`)
      })

      it('should show the message for 2 weekdays', async () => {
        const selectedSlot = slotsMock.results[0]

        const nextMonday = moment().add(1, 'weeks').day(1).toDate()
        const nextTuesday = moment().add(1, 'weeks').day(2).toDate()

        const dayToSelectNumber = getNumberDay(nextMonday)
        const dayToSelectLongName = getLongDayName(nextMonday)

        const responses = [
          {
            path: `/customers/1/orders/44051/`,
            responseBody: {
              ...order,
              address,
              slot: selectedSlot,
              start_date: selectedSlot.start,
            },
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody:
              preparedLinesWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct(
                nextTuesday,
                [nextMonday, nextTuesday],
              ),
          },
          {
            path: `/customers/1/addresses/`,
            responseBody: {
              results: [address],
            },
          },
          {
            path: `/customers/1/addresses/${address.id}/slots/`,
            multipleResponses: [
              { responseBody: slotsMock },
              { responseBody: slotsMock },
            ],
          },
          {
            path: '/customers/1/orders/44051/remove-lines/',
            method: 'post',
            requestBody: {
              product_ids: ['8731'],
            },
            responseBody: {
              ...order,
              address,
              slot: selectedSlot,
              start_date: selectedSlot.start,
              summary: {
                ...order.summary,
                total: '55.55',
              },
            },
          },
        ]
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork(responses)
          .withLogin()
          .mount()

        await screen.findByText('70,96 €')
        await clickToModifyDelivery()
        await screen.findByText(`Pick a day for ${address.postal_code}`)

        selectDeliveryDate(`${dayToSelectLongName}, ${dayToSelectNumber}`)

        const modal = screen.queryByRole('dialog')

        expect(modal).toBeInTheDocument()

        expect(modal).toHaveTextContent(`Not available on Monday, Tuesday`)
      })

      it('should show the message for 3 or more weekdays', async () => {
        const selectedSlot = slotsMock.results[0]

        const nextMonday = moment().add(1, 'weeks').day(1).toDate()
        const nextTuesday = moment().add(1, 'weeks').day(2).toDate()
        const nextWednesday = moment().add(1, 'weeks').day(3).toDate()

        const dayToSelectNumber = getNumberDay(nextMonday)
        const dayToSelectLongName = getLongDayName(nextMonday)

        const responses = [
          {
            path: `/customers/1/orders/44051/`,
            responseBody: {
              ...order,
              address,
              slot: selectedSlot,
              start_date: selectedSlot.start,
            },
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody:
              preparedLinesWithUnavailableFromAndMultipleUnavailableWeekdaysBlinkingProduct(
                nextTuesday,
                [nextMonday, nextTuesday, nextWednesday],
              ),
          },
          {
            path: `/customers/1/addresses/`,
            responseBody: {
              results: [address],
            },
          },
          {
            path: `/customers/1/addresses/${address.id}/slots/`,
            multipleResponses: [
              { responseBody: slotsMock },
              { responseBody: slotsMock },
            ],
          },
          {
            path: '/customers/1/orders/44051/remove-lines/',
            method: 'post',
            requestBody: {
              product_ids: ['8731'],
            },
            responseBody: {
              ...order,
              address,
              slot: selectedSlot,
              start_date: selectedSlot.start,
              summary: {
                ...order.summary,
                total: '55.55',
              },
            },
          },
        ]
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork(responses)
          .withLogin()
          .mount()

        await screen.findByText('70,96 €')
        await clickToModifyDelivery()
        await screen.findByText(`Pick a day for ${address.postal_code}`)

        selectDeliveryDate(`${dayToSelectLongName}, ${dayToSelectNumber}`)

        const modal = screen.queryByRole('dialog')

        expect(modal).toBeInTheDocument()

        expect(modal).toHaveTextContent(
          `Only available on Thursday, Friday, Saturday`,
        )
      })
    })

    describe('when the product is only unavailable because of the unavailable from date', () => {
      it('should show the modal with unavailable from date', async () => {
        const selectedSlot = slotsMock.results[0]

        const today = new Date()
        const tomorrow = new Date(today)
        const dayAfterTomorrow = new Date(today)

        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const dayToSelectNumber = getNumberDay(tomorrow)
        const dayToSelectLongName = getLongDayName(tomorrow)

        const month = getStringMonthDay(tomorrow)
        const day = getNumberDay(tomorrow)

        const responses = [
          {
            path: `/customers/1/orders/44051/`,
            responseBody: {
              ...order,
              address,
              slot: selectedSlot,
              start_date: selectedSlot.start,
            },
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody:
              preparedLinesWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
                tomorrow,
                dayAfterTomorrow,
              ),
          },
          {
            path: `/customers/1/addresses/`,
            responseBody: {
              results: [address],
            },
          },
          {
            path: `/customers/1/addresses/${address.id}/slots/`,
            multipleResponses: [
              { responseBody: slotsMock },
              { responseBody: slotsMock },
            ],
          },
          {
            path: '/customers/1/orders/44051/remove-lines/',
            method: 'post',
            requestBody: {
              product_ids: ['8731'],
            },
            responseBody: {
              ...order,
              address,
              slot: selectedSlot,
              start_date: selectedSlot.start,
              summary: {
                ...order.summary,
                total: '55.55',
              },
            },
          },
        ]
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork(responses)
          .withLogin()
          .mount()

        await screen.findByText('70,96 €')
        await clickToModifyDelivery()
        await screen.findByText(`Pick a day for ${address.postal_code}`)

        selectDeliveryDate(`${dayToSelectLongName}, ${dayToSelectNumber}`)

        const modal = screen.queryByRole('dialog')

        expect(
          within(modal).getByText(`Not available from ${month} ${day}`),
        ).toBeInTheDocument()
      })
    })

    describe('when the product is unavailable because of the weekdays and the unavailable from date', () => {
      it('should show the modal with unavailable from date', async () => {
        const selectedSlot = slotsMock.results[0]

        const today = new Date()
        const tomorrow = new Date(today)
        const dayAfterTomorrow = new Date(today)

        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const dayToSelectNumber = getNumberDay(tomorrow)
        const dayToSelectLongName = getLongDayName(tomorrow)

        const month = getStringMonthDay(tomorrow)
        const day = getNumberDay(tomorrow)

        const responses = [
          {
            path: `/customers/1/orders/44051/`,
            responseBody: {
              ...order,
              address,
              slot: selectedSlot,
              start_date: selectedSlot.start,
            },
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody:
              preparedLinesWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
                tomorrow,
                tomorrow,
              ),
          },
          {
            path: `/customers/1/addresses/`,
            responseBody: {
              results: [address],
            },
          },
          {
            path: `/customers/1/addresses/${address.id}/slots/`,
            multipleResponses: [
              { responseBody: slotsMock },
              { responseBody: slotsMock },
            ],
          },
          {
            path: '/customers/1/orders/44051/remove-lines/',
            method: 'post',
            requestBody: {
              product_ids: ['8731'],
            },
            responseBody: {
              ...order,
              address,
              slot: selectedSlot,
              start_date: selectedSlot.start,
              summary: {
                ...order.summary,
                total: '55.55',
              },
            },
          },
        ]
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork(responses)
          .withLogin()
          .mount()

        await screen.findByText('70,96 €')
        await clickToModifyDelivery()
        await screen.findByText(`Pick a day for ${address.postal_code}`)

        selectDeliveryDate(`${dayToSelectLongName}, ${dayToSelectNumber}`)

        const modal = screen.queryByRole('dialog')

        expect(
          within(modal).getByText(`Not available from ${month} ${day}`),
        ).toBeInTheDocument()
      })
    })
  })

  describe('When the user has no blinking product in the cart', () => {
    it('should not show the modal', async () => {
      const selectedSlot = slotsMock.results[0]

      const today = new Date()
      const tomorrow = new Date(today)
      const dayAfterTomorrow = new Date(today)

      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const dayToSelectNumber = getNumberDay(tomorrow)
      const dayToSelectLongName = getLongDayName(tomorrow)

      const responses = [
        {
          path: `/customers/1/orders/44051/`,
          responseBody: {
            ...order,
            address,
            slot: selectedSlot,
            start_date: selectedSlot.start,
          },
        },
        {
          path: '/customers/1/orders/44051/lines/prepared/',
          responseBody:
            preparedLinesWithUnavailableFromAndUnavailableWeekdaysBlinkingProduct(
              dayAfterTomorrow,
              dayAfterTomorrow,
            ),
        },
        {
          path: `/customers/1/addresses/`,
          responseBody: {
            results: [address],
          },
        },
        {
          path: `/customers/1/addresses/${address.id}/slots/`,
          multipleResponses: [
            { responseBody: slotsMock },
            { responseBody: slotsMock },
          ],
        },
        {
          path: '/customers/1/orders/44051/remove-lines/',
          method: 'post',
          requestBody: {
            product_ids: ['8731'],
          },
          responseBody: {
            ...order,
            address,
            slot: selectedSlot,
            start_date: selectedSlot.start,
            summary: {
              ...order.summary,
              total: '55.55',
            },
          },
        },
      ]
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork(responses)
        .withLogin()
        .mount()

      await screen.findByText('70,96 €')
      await clickToModifyDelivery()
      await screen.findByText(`Pick a day for ${address.postal_code}`)

      selectDeliveryDate(`${dayToSelectLongName}, ${dayToSelectNumber}`)

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })
})
