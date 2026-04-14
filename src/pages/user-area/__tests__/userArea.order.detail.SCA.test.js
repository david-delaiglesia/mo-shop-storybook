import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import {
  order,
  orderDisruptedPayment,
  orderWithPaymentMethodUpdated,
  preparedLines,
} from 'app/order/__scenarios__/orderDetail'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import { paymentAuthenticationRequired } from 'app/payment/__scenarios__/payments'
import {
  clickToModifyPaymentMethod,
  clickToSavePaymentMethod,
} from 'pages/__tests__/helper'
import { selectExistentPaymentMethod } from 'pages/__tests__/helpers/payment'
import {
  changePaymentScaChallengeSuccess,
  scaChallengeError,
  tryAnotherPaymentMethod,
} from 'pages/order-products/__tests__/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User area - Order detail - SCA', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

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
          PaymentMethodMother.bizum(false),
        ],
      },
    },
    {
      path: '/customers/1/orders/44051/payment-method/',
      method: 'put',
      status: 418,
      requestBody: { payment_method: { id: 4720 } },
      responseBody: paymentAuthenticationRequired,
    },
    {
      path: '/customers/1/payment-cards/auth/sca_id/',
      responseBody: PaymentAuthenticationMother.redsysCard(),
    },
  ]

  it('should update payment method with authentication', async () => {
    const responsesAfterSCA = [
      {
        path: '/customers/1/orders/44051/',
        multipleResponses: [
          {
            responseBody: OrderMother.confirmed(),
          },
          {
            responseBody: OrderMother.confirmedWithMastercard(),
          },
        ],
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
    await screen.findByTestId('sca-form')

    expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
      'log_start_psd2_flow',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('start_psd2_flow', {
      payment_method_type: 'card',
      type: 'authentication',
      provider: 'redsys',
      payment_authentication_uuid: 'sca_id',
      user_flow: 'edit_order',
      is_MIT: false,
    })

    changePaymentScaChallengeSuccess(() => mountApp(responsesAfterSCA))
    const paymentUpdated = await screen.findByText('**** 6023')

    expect(window.history.state).toEqual({})
    expect(paymentUpdated).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
      status: 'success',
      user_flow: 'edit_order',
      payment_authentication_uuid: 'sca_id',
    })
  })

  it('should display a loader while the challenge is loading', async () => {
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
    await screen.findByTestId('sca-form')

    const loaderModal = screen.getByRole('dialog')
    expect(loaderModal).toBeInTheDocument()
    expect(loaderModal).toHaveTextContent('Connecting with your bank')
    expect(loaderModal).toHaveTextContent('It may take a few seconds...')
  })

  it('should ask for SCA after changing the payment method', async () => {
    const responsesAfterSCA = [
      { path: '/customers/1/orders/44051/', responseBody: order },
      {
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody: preparedLines,
      },
      {
        path: '/customers/1/orders/44051/payment-method/',
        method: 'put',
        status: 418,
        requestBody: { payment_method: { id: 4720 } },
        responseBody: paymentAuthenticationRequired,
      },
      {
        path: '/customers/1/payment-cards/',
        responseBody: {
          results: [
            PaymentMethodMother.creditCardVisaValid(),
            PaymentMethodMother.creditCardMastercardValid(false),
            PaymentMethodMother.bizum(false),
          ],
        },
      },
      {
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: PaymentAuthenticationMother.redsysCard(),
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
    await screen.findByTestId('sca-form')

    scaChallengeError(() => mountApp(responsesAfterSCA))
    await screen.findByText('The changes were not saved correctly')
    tryAnotherPaymentMethod()
    await screen.findByRole('dialog', {
      name: 'Use a different card for this order',
    })
    await selectExistentPaymentMethod('Mastercard, **** 6023, Expires 01/23')
    await clickToSavePaymentMethod()
    const SCAForm = await screen.findByTestId('sca-form')

    expect(
      screen.getByLabelText('Connecting with your bank'),
    ).toBeInTheDocument()
    expect(SCAForm).toBeInTheDocument()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
      status: 'failed',
      user_flow: 'edit_order',
      payment_authentication_uuid: 'sca_id',
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'failed_authentication_alert_retry_click',
      {
        flow: 'edit_payment_method',
      },
    )
  })

  it('should hide the payment method selector after retry payment with SCA', async () => {
    const responses = [
      {
        path: '/customers/1/orders/44051/',
        responseBody: orderDisruptedPayment,
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
            PaymentMethodMother.bizum(false),
          ],
        },
      },
      {
        path: '/customers/1/orders/44051/payment-method/',
        method: 'put',
        requestBody: { payment_method: { id: 4720 } },
        responseBody: orderDisruptedPayment,
      },
      {
        path: '/customers/1/orders/44051/payment-retry/',
        method: 'post',
        responseBody: orderWithPaymentMethodUpdated,
      },
    ]
    Storage.setItem('sca_update_payment', { id: 4720 })
    changePaymentScaChallengeSuccess(() => {
      wrap(App)
        .atPath('/user-area/orders/44051/')
        .withNetwork(responses)
        .withLogin()
        .mount()
    })

    await screen.findByText('Order 44051')

    expect(screen.queryByText('**** 6007')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Payment method for this order:'),
    ).not.toBeInTheDocument()
  })

  it('should be able to handle a server error in the update payment info request', async () => {
    const responses = [
      { path: '/customers/1/orders/44051/', responseBody: order },
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
            PaymentMethodMother.bizum(false),
          ],
        },
      },
      {
        path: '/customers/1/orders/44051/payment-method/',
        method: 'put',
        status: 500,
        requestBody: { payment_method: { id: 4720 } },
      },
    ]
    wrap(App)
      .atPath('/user-area/orders/44051/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')
    await clickToModifyPaymentMethod()
    await selectExistentPaymentMethod('Mastercard, **** 6023, Expires 01/23')

    await clickToSavePaymentMethod()
    const errorTitle = await screen.findByText(
      'Sorry, the content of this page cannot be displayed.',
    )

    expect(errorTitle).toBeInTheDocument()
  })
})
