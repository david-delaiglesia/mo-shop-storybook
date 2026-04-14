import { screen } from '@testing-library/react'

import {
  confirmOrderEdition,
  incrementProductInCart,
  scaChallengeError,
  tokenizationChallengeSuccess,
  tryAnotherPaymentMethod,
} from './helpers'
import { type NetworkResponses, configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { orderCartWithValidPrice } from 'app/order/__scenarios__/orderCart'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import { paymentAuthenticationRequired } from 'app/payment/__scenarios__/payments'
import {
  clickToAddNewPaymentMethod,
  selectNewPaymentMethodCard,
} from 'pages/__tests__/helper'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { SystemAlert } from 'services/system-alert'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit Order - SCA - 3DSecure', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const defaultResponses: NetworkResponses = [
    {
      path: '/customers/1/orders/44051/',
      responseBody: OrderMother.confirmed(),
    },
    { path: '/categories/', responseBody: categories },
    { path: '/categories/112/', responseBody: categoryDetail },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]

  afterEach(() => {
    sessionStorage.clear()
  })

  it('should disable the system alert before a tokenization with 3DS', async () => {
    SystemAlert.deactivate = vi.fn()
    const responsesBeforeSCA: NetworkResponses = [
      ...defaultResponses,
      {
        path: '/customers/1/orders/44051/cart/',
        responseBody: orderCartWithValidPrice,
      },
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        status: 418,
        responseBody: paymentAuthenticationRequired,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '8731', sources: ['+CT'] },
              { id: 1, quantity: 20, product_id: '3317', sources: [] },
              { id: 2, quantity: 3, product_id: '71502', sources: [] },
            ],
          },
        },
      },
      {
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: PaymentAuthenticationMother.redsysCard(),
      },
    ]
    const responsesAfterSCA: NetworkResponses = [
      ...defaultResponses,
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        status: 418,
        responseBody: paymentAuthenticationRequired,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '8731', sources: ['+CT'] },
              { id: 1, quantity: 20, product_id: '3317', sources: [] },
              { id: 2, quantity: 3, product_id: '71502', sources: [] },
            ],
          },
        },
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
        path: '/customers/1/payment-cards/new/',
        responseBody: PaymentAuthenticationMother.cecaCard(),
      },
      {
        path: '/customers/1/orders/44051/payment-method/',
        method: 'put',
        requestBody: { payment_method: { id: 4687 } },
      },
    ]
    const mountApp = (responses: NetworkResponses) =>
      wrap(App)
        .atPath('/orders/44051/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()
    mountApp(responsesBeforeSCA)
    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()
    await screen.findByTestId('sca-form')

    scaChallengeError(() => mountApp(responsesAfterSCA))
    await screen.findByText('The changes were not saved correctly')
    tryAnotherPaymentMethod()

    await screen.findByRole('dialog', {
      name: 'Use a different card for this order',
    })

    await clickToAddNewPaymentMethod()
    await selectNewPaymentMethodCard()
    await screen.findByTitle('payment-card-tpv-iframe')

    expect(SystemAlert.deactivate).toHaveBeenCalled()
  })

  it('should update the payment list after a tokenization success with 3DS', async () => {
    SystemAlert.deactivate = vi.fn()
    const responsesBeforeSCA: NetworkResponses = [
      ...defaultResponses,
      {
        path: '/customers/1/orders/44051/cart/',
        responseBody: orderCartWithValidPrice,
      },
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        status: 418,
        responseBody: paymentAuthenticationRequired,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '8731', sources: ['+CT'] },
              { id: 1, quantity: 20, product_id: '3317', sources: [] },
              { id: 2, quantity: 3, product_id: '71502', sources: [] },
            ],
          },
        },
      },
      {
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: PaymentAuthenticationMother.redsysCard(),
      },
    ]
    const responsesAfterSCA: NetworkResponses = [
      ...defaultResponses,
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        status: 418,
        responseBody: paymentAuthenticationRequired,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { quantity: 1, product_id: '8731', sources: ['+CT'] },
              { id: 1, quantity: 20, product_id: '3317', sources: [] },
              { id: 2, quantity: 3, product_id: '71502', sources: [] },
            ],
          },
        },
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
        path: '/customers/1/payment-cards/new/',
        responseBody: PaymentAuthenticationMother.cecaCard(),
      },
      {
        path: '/customers/1/orders/44051/payment-method/',
        method: 'put',
        requestBody: { payment_method: { id: 4687 } },
      },
    ]
    const responsesAfterNewTokenization = [
      ...defaultResponses,
      {
        path: '/customers/1/payment-cards/',
        responseBody: {
          results: [
            PaymentMethodMother.creditCardVisaValid(false),
            PaymentMethodMother.creditCardMastercardValid(true),
          ],
        },
      },
    ]
    const mountApp = (responses: NetworkResponses) =>
      wrap(App)
        .atPath('/orders/44051/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()
    mountApp(responsesBeforeSCA)
    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()
    await screen.findByTestId('sca-form')

    scaChallengeError(() => mountApp(responsesAfterSCA))
    await screen.findByText('The changes were not saved correctly')
    tryAnotherPaymentMethod()
    await screen.findByRole('dialog', {
      name: 'Use a different card for this order',
    })
    await clickToAddNewPaymentMethod()
    await selectNewPaymentMethodCard()
    await screen.findByTitle('payment-card-tpv-iframe')

    expect(SystemAlert.deactivate).toHaveBeenCalled()

    tokenizationChallengeSuccess(() => mountApp(responsesAfterNewTokenization))
    const dialog = await screen.findByRole('dialog', {
      name: 'Use a different card for this order',
    })

    expect(dialog).toBeInTheDocument()
  })
})
