import { cleanup, screen, waitFor } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { PaymentAuthenticationRequiredException, PaymentTPV } from 'app/payment'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import {
  clickToModifyPaymentMethod,
  clickToSavePaymentMethod,
} from 'pages/__tests__/helper'
import { selectExistentPaymentMethod } from 'pages/__tests__/helpers/payment'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Order Detail - Change Existent Payment Method', () => {
  configure({
    changeRoute: history.push,
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    Storage.clear()
    localStorage.clear()
    cleanup()
  })

  describe('User Area - Order Detail - Change Existent Payment Method Bizum', () => {
    it('should update payment method to bizum', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            multipleResponses: [
              {
                responseBody: OrderMother.confirmed(),
              },
              {
                responseBody: OrderMother.confirmedWithBizum(),
              },
            ],
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(false),
              ],
            },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      await clickToModifyPaymentMethod()
      await selectExistentPaymentMethod('Bizum, +34 700000000, Bizum')
      await clickToSavePaymentMethod()

      await waitFor(() => {
        expect(
          '/customers/1/orders/44051/payment-method/',
        ).toHaveBeenFetchedWith({
          method: 'PUT',
          body: { payment_method: { id: PaymentMethodMother.bizum().id } },
        })
      })
    })

    it('should redirect to TPV on authentication_required exception', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: '/customers/1/orders/44051/lines/prepared/',
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardMastercardValid(),
                PaymentMethodMother.bizum(),
              ],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-method/',
            method: 'PUT',
            requestBody: {
              payment_method: { id: PaymentMethodMother.bizum().id },
            },
            status: 400,
            responseBody: {
              errors: [
                PaymentAuthenticationRequiredException.toJSON({
                  authentication_uuid: 'payment_authentication_uuid',
                }),
              ],
            },
          },
          {
            path: `/customers/1/orders/44051/authentication/?${new URLSearchParams(
              {
                lang: 'en',
                wh: 'vlc1',
                authentication_uuid: 'payment_authentication_uuid',
                ok_url: `http://localhost:3000/user-area/orders/44051?${new URLSearchParams(
                  {
                    status: 'success',
                    payment_method: 'bizum',
                    payment_flow: 'update_order_payment_method',
                    payment_authentication_uuid: 'payment_authentication_uuid',
                  },
                )}`,
                ko_url: `http://localhost:3000/user-area/orders/44051?${new URLSearchParams(
                  {
                    status: 'failure',
                    payment_method: 'bizum',
                    payment_flow: 'update_order_payment_method',
                    payment_authentication_uuid: 'payment_authentication_uuid',
                  },
                )}`,
              },
            )}`,
            catchParams: true,
            method: 'GET',
            responseBody: PaymentAuthenticationMother.redsysBizum(),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      await clickToModifyPaymentMethod()
      await selectExistentPaymentMethod('Bizum, +34 700000000, Bizum')
      await clickToSavePaymentMethod()

      await waitFor(() => {
        expect(
          PaymentTPV.autoRedirectToPaymentAuth,
        ).toHaveBeenCalledExactlyOnceWith(
          PaymentAuthenticationMother.redsysBizum().params,
        )
      })
    })
  })
})
