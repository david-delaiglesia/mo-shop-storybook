import { screen } from '@testing-library/react'

import {
  continueWithoutBlinkingProduct,
  keepShopping,
  selectDeliveryDate,
  selectDifferentDayBlinkingProduct,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { address } from 'app/address/__scenarios__/address'
import { MinPurchaseAmountNotReachedException } from 'app/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  checkout,
  checkoutWithoutSlotWithBlinkingProduct,
} from 'app/checkout/__scenarios__/checkout'
import { slotsMock } from 'containers/slots-container/__tests__/mocks'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'
import { getEnglishShortWeekDay } from 'utils/dates'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Delivery - Blinking Products', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  describe('Checkout - Delivery - Blinking Products Metrics', () => {
    it('should send metric when show the modal when select a day that match with a blinking product', async () => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
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

      expect(Tracker.sendViewChange).toHaveBeenCalledWith(
        'unavailable_day_product_alert',
        {
          cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          merca: ['28745'],
          weekday: getEnglishShortWeekDay(tomorrow).toLowerCase(),
          cart_mode: 'purchase',
          purchase_id: undefined,
        },
      )
    })

    it('should send metric when close the modal and reset the day selected', async () => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
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
      selectDifferentDayBlinkingProduct()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'pick_other_day_unavailable_day_product_alert_click',
        {
          cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          merca: ['28745'],
          weekday: getEnglishShortWeekDay(tomorrow).toLowerCase(),
          cart_mode: 'purchase',
        },
      )
    })

    it('should send metric when update the checkout when confirm remove blinking products', async () => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            multipleResponses: [
              {
                responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
              },
              {
                responseBody: checkout,
              },
            ],
          },
          {
            path: '/customers/1/addresses/1/slots/',
            responseBody: slotsMock,
          },
          {
            path: '/customers/1/checkouts/5/remove-lines/',
            method: 'post',
            requestBody: {
              product_ids: ['28745'],
            },
          },
          {
            path: '/customers/1/addresses/',
            responseBody: { results: [address] },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('60,00 €')
      selectDeliveryDate(tomorrow.getDate())
      continueWithoutBlinkingProduct()
      await screen.findByText('75,46 €')

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'continue_unavailable_day_product_alert_click',
        {
          cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          merca: ['28745'],
          weekday: getEnglishShortWeekDay(tomorrow).toLowerCase(),
          cart_mode: 'purchase',
        },
      )
    })

    it('should send metric when see a modal when remove blinking displays the minimum purchase modal', async () => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
          },
          {
            path: '/customers/1/addresses/1/slots/',
            responseBody: slotsMock,
          },
          {
            path: '/customers/1/checkouts/5/remove-lines/',
            method: 'post',
            requestBody: {
              product_ids: ['28745'],
            },
            responseBody: {
              errors: [
                MinPurchaseAmountNotReachedException.toJSON({
                  detail:
                    'Remember that to place your order the minimum amount is €60',
                }),
              ],
            },
            status: 400,
          },
          {
            path: '/customers/1/addresses/',
            responseBody: { results: [address] },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('60,00 €')
      selectDeliveryDate(tomorrow.getDate())
      continueWithoutBlinkingProduct()
      await screen.findByRole('dialog', {
        name: 'Minimum order. Remember that to place your order the minimum amount is €60',
      })

      expect(Tracker.sendViewChange).toHaveBeenCalledWith(
        'unavailable_products_minimum_price_alert',
        {
          cart_mode: 'purchase',
        },
      )
    })

    it('should send metric when go to the home after confirm the minimum purchase modal', async () => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: checkoutWithoutSlotWithBlinkingProduct(tomorrow),
          },
          {
            path: '/customers/1/addresses/1/slots/',
            responseBody: slotsMock,
          },
          {
            path: '/customers/1/checkouts/5/remove-lines/',
            method: 'post',
            requestBody: {
              product_ids: ['28745'],
            },
            status: 400,
            responseBody: {
              errors: [
                MinPurchaseAmountNotReachedException.toJSON({
                  detail:
                    'Remember that to place your order the minimum amount is €60',
                }),
              ],
            },
          },
          { path: '/customers/1/home/', responseBody: homeWithGrid },
          {
            path: '/customers/1/addresses/',
            responseBody: { results: [address] },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('60,00 €')
      selectDeliveryDate(tomorrow.getDate())
      continueWithoutBlinkingProduct()
      await screen.findByRole('dialog', {
        name: 'Minimum order. Remember that to place your order the minimum amount is €60',
      })
      keepShopping()
      await screen.findByText('Novedades')

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'continue_minimum_price_alert_click',
      )
    })
  })
})
