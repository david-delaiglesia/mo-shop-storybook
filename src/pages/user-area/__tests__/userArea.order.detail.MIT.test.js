import { screen } from '@testing-library/react'

import { authorizeMIT } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import { paymentAuthenticationRequired } from 'app/payment/__scenarios__/payments'
import {
  clickToModifyPaymentMethod,
  clickToSavePaymentMethod,
} from 'pages/__tests__/helper'
import { selectExistentPaymentMethod } from 'pages/__tests__/helpers/payment'
import { changePaymentScaChallengeSuccess } from 'pages/order-products/__tests__/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User area - Order - Detail - MIT', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should accept the MIT term', async () => {
    const responsesBeforeSCA = [
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
            PaymentMethodMother.creditCardVisaValid(),
            PaymentMethodMother.creditCardMastercardValid(false),
          ],
        },
      },
      {
        path: '/customers/1/orders/44051/payment-method/',
        method: 'put',
        status: 419,
        requestBody: { payment_method: { id: 4720 } },
        responseBody: paymentAuthenticationRequired,
      },
      {
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: PaymentAuthenticationMother.redsysCard(),
      },
    ]
    const responsesAfterSCA = [
      {
        path: '/customers/1/orders/44051/',
        responseBody: OrderMother.confirmedWithMastercard(),
      },
      {
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody: preparedLines,
      },
      {
        path: '/customers/1/orders/44051/payment-method/',
        method: 'put',
        requestBody: { payment_method: { id: 4720 } },
      },
    ]
    const mountApp = (responses) =>
      wrap(App)
        .atPath('/user-area/orders/44051/')
        .withNetwork(responses)
        .withLogin()
        .mount()
    mountApp(responsesBeforeSCA)

    await screen.findByText('Order 44051')
    await clickToModifyPaymentMethod()

    await selectExistentPaymentMethod('Mastercard, **** 6023, Expires 01/23')
    await clickToSavePaymentMethod()
    await screen.findByText('Authorisation required')
    authorizeMIT()
    await screen.findByTestId('sca-form')
    changePaymentScaChallengeSuccess(() => mountApp(responsesAfterSCA))

    await screen.findByText('**** 6023')

    expect(Tracker.sendViewChange).toHaveBeenCalledWith('mit_term', {
      flow: 'edit_payment_method',
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'mit_term_accept_button_click',
    )
  })
})
