import { screen } from '@testing-library/react'

import {
  changePaymentScaChallengeSuccess,
  confirmOrderEdition,
  incrementProductInCart,
  scaChallengeError,
  tryAnotherPaymentMethod,
} from './helpers'
import { type NetworkResponses, configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { CartMother } from 'app/cart/__scenarios__/CartMother'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
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
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order - SCA', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Storage.clear()
    vi.clearAllMocks()
  })

  it('should ask for SCA after changing the payment method with authentication required', async () => {
    vi.spyOn(window.history, 'replaceState')
    const responsesBeforeSca: NetworkResponses = [
      {
        path: '/customers/1/orders/44051/',
        responseBody: OrderMother.confirmed(),
      },
      {
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody: preparedLines,
      },
      {
        path: '/customers/1/orders/44051/cart/',
        responseBody: CartMother.simple(),
      },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        status: 418,
        responseBody: paymentAuthenticationRequired,
        requestBody: {
          cart: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              { id: 1, quantity: 6, product_id: '8731', sources: ['+CT'] },
              { id: 2, quantity: 5, product_id: '3317' },
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
        status: 418,
        requestBody: { payment_method: { id: 4720 } },
        responseBody: paymentAuthenticationRequired,
      },
      {
        path: '/customers/1/payment-cards/auth/sca_id/?lang=en&wh=vlc1&ok_url=http://localhost:3000/sca_update_payment_ok.html?url=http://localhost:3000/orders/44051/edit/products&ko_url=http://localhost:3000/sca_update_payment_ko.html?url=http://localhost:3000/orders/44051/edit/products&checkout_auto_confirm=yes',
        responseBody: PaymentAuthenticationMother.redsysCard(),
        catchParams: true,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    const responsesAfterChangePaymentSca: NetworkResponses = [
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
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
    expect(window.history.replaceState).toHaveBeenCalledWith(
      { key: expect.any(String), state: undefined },
      'Mercadona compra online',
      '/sca_confirm_ko.html?url=http://localhost:3000/orders/44051/edit/products',
    )

    scaChallengeError(() => mountApp(responsesAfterSca))
    await screen.findByText('The changes were not saved correctly')
    tryAnotherPaymentMethod()
    await screen.findByRole('dialog', {
      name: 'Use a different card for this order',
    })
    await selectExistentPaymentMethod('Mastercard, **** 6023, Expires 01/23')
    await clickToSavePaymentMethod()

    await screen.findByTestId('sca-form')

    changePaymentScaChallengeSuccess(() =>
      mountApp(responsesAfterChangePaymentSca),
    )

    expect('/customers/1/orders/44051/payment-method/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: { payment_method: { id: 4720 } },
    })
  })
})
