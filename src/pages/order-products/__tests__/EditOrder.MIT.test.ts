import { screen } from '@testing-library/react'

import {
  authorizeMIT,
  confirmOrderEdition,
  incrementProductInCart,
  scaChallengeError,
  scaChallengeSuccess,
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
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import {
  paymentAuthenticationRequired,
  paymentAuthenticationRequiredForNewCard,
} from 'app/payment/__scenarios__/payments'
import { clickToSavePaymentMethod } from 'pages/__tests__/helper'
import { selectExistentPaymentMethod } from 'pages/__tests__/helpers/payment'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order - MIT', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    sessionStorage.clear()
    vi.spyOn(window.history, 'state', 'get')
    vi.clearAllMocks()
  })

  const defaultResponses: NetworkResponses = [
    {
      path: '/customers/1/orders/44051/',
      responseBody: OrderMother.confirmed(),
    },
    {
      path: '/customers/1/orders/44051/lines/prepared/',
      responseBody: preparedLines,
    },
    { path: '/categories/', responseBody: categories },
    { path: '/categories/112/', responseBody: categoryDetail },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]

  it('should accept the MIT term', async () => {
    const responsesBeforeSCA: NetworkResponses = [
      ...defaultResponses,
      {
        path: '/customers/1/orders/44051/cart/',
        responseBody: orderCartWithValidPrice,
      },
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        status: 419,
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
        responseBody: orderCartWithValidPrice,
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
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody: preparedLines,
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
    await screen.findByText('Authorisation required')
    authorizeMIT()
    await screen.findByTestId('sca-form')
    await screen.findByRole('dialog', { name: 'Connecting with your bank' })
    scaChallengeSuccess(() => mountApp(responsesAfterSCA))
    await screen.findByText('Order updated')

    expect(Tracker.sendViewChange).toHaveBeenCalledWith('mit_term', {
      flow: 'edit_order',
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'mit_term_accept_button_click',
    )
  })

  it('should accept the MIT term after changing the payment method with authentication required', async () => {
    const responsesBeforeSca: NetworkResponses = [
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
    const responsesAfterSca: NetworkResponses = [
      ...defaultResponses,
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
        path: '/customers/1/payment-cards/auth/new_card_sca_id/',
        responseBody: PaymentAuthenticationMother.redsysCard(),
      },
      {
        method: 'put',
        path: '/customers/1/orders/44051/payment-method/',
        status: 419,
        requestBody: { payment_method: { id: 4720 } },
        responseBody: paymentAuthenticationRequired,
      },
      {
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: PaymentAuthenticationMother.redsysCard(),
      },
    ]
    const responsesAfterChangePaymentSca: NetworkResponses = [
      ...defaultResponses,
      {
        method: 'put',
        path: '/customers/1/orders/44051/payment-method/',
        requestBody: { payment_method: { id: 4687 } },
      },
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        status: 418,
        responseBody: paymentAuthenticationRequiredForNewCard,
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
    ]
    const mountApp = (responses: NetworkResponses) =>
      wrap(App)
        .atPath('/orders/44051/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()
    mountApp(responsesBeforeSca)

    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()
    await screen.findByTestId('sca-form')
    await screen.findByRole('dialog', { name: 'Connecting with your bank' })
    scaChallengeError(() => mountApp(responsesAfterSca))
    await screen.findByText('The changes were not saved correctly')
    tryAnotherPaymentMethod()
    await screen.findByRole('dialog', {
      name: 'Use a different card for this order',
    })
    await selectExistentPaymentMethod('Mastercard, **** 6023, Expires 01/23')
    await clickToSavePaymentMethod()
    await screen.findByText('Authorisation required')
    authorizeMIT()
    await screen.findByTestId('sca-form')
    scaChallengeSuccess(() => mountApp(responsesAfterChangePaymentSca))

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'mit_term_accept_button_click',
    )
  })
})
