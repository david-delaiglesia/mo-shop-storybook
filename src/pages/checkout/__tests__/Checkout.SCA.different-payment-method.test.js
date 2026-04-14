import { screen } from '@testing-library/react'

import { confirmCheckout } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import { paymentAuthenticationRequired } from 'app/payment/__scenarios__/payments'
import {
  continueWithSCA,
  savePaymentMethod,
  selectExistentPaymentMethod,
} from 'pages/__tests__/helpers/payment'
import {
  scaChallengeError,
  tryAnotherPaymentMethod,
} from 'pages/order-products/__tests__/helpers'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

const responsesBeforeSCA = [
  { path: '/customers/1/checkouts/5/', responseBody: CheckoutMother.filled() },
  {
    path: '/customers/1/checkouts/5/orders/',
    method: 'post',
    status: 418,
    responseBody: paymentAuthenticationRequired,
  },
  {
    path: '/customers/1/payment-cards/auth/sca_id/',
    responseBody: PaymentAuthenticationMother.redsysCard(),
  },
]

beforeEach(() => {
  history.replace('/')
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

afterEach(() => {
  vi.clearAllMocks()
  Storage.clear()
  localStorage.clear()
})

it('after an error in the SCA challenge, allows to confirm a checkout with a different payment method', async () => {
  const responsesAfterSCA = [
    {
      path: '/customers/1/checkouts/5/',
      responseBody: CheckoutMother.filled(),
    },
    { path: '/customers/1/orders/', responseBody: { results: [] } },
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
      method: 'put',
      path: '/customers/1/checkouts/5/payment-method/',
      requestBody: { payment_method: { id: 4687 } },
    },
    {
      path: '/customers/1/checkouts/5/orders/',
      method: 'post',
      status: 418,
      responseBody: paymentAuthenticationRequired,
    },
    {
      path: '/customers/1/payment-cards/auth/sca_id/',
      responseBody: PaymentAuthenticationMother.redsysCard(),
    },
  ]
  const mountApp = (responses) =>
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
  mountApp(responsesBeforeSCA)

  await screen.findByRole('button', { name: 'Confirm order' })
  confirmCheckout()
  await continueWithSCA()
  await screen.findByTestId('sca-form')

  scaChallengeError(() => mountApp(responsesAfterSCA))
  await screen.findByText('We’re sorry, we couldn’t complete the order')
  tryAnotherPaymentMethod()

  await selectExistentPaymentMethod('Mastercard, **** 6023, Expires 01/23')
  savePaymentMethod()
  await confirmCheckout()

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'failed_authentication_alert_retry_click',
    {
      flow: 'checkout',
    },
  )

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
    status: 'failed',
    user_flow: 'checkout',
    payment_authentication_uuid: 'sca_id',
  })
})
