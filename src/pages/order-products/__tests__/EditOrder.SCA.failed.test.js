import { screen, within } from '@testing-library/react'

import {
  cancelChangePayment,
  closeSCAWithoutSaving,
  confirmOrderEdition,
  incrementProductInCart,
  scaChallengeError,
  tryAnotherPaymentMethod,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { orderCartWithValidPrice } from 'app/order/__scenarios__/orderCart'
import { order, preparedLines } from 'app/order/__scenarios__/orderDetail'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import { paymentAuthenticationRequired } from 'app/payment/__scenarios__/payments'
import {
  clickToAddNewPaymentMethod,
  selectNewPaymentMethodCard,
} from 'pages/__tests__/helper'
import { rejectAddPaymentMethod } from 'pages/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order - SCA', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const defaultResponses = [
    { path: '/customers/1/orders/44051/', responseBody: order },
    {
      path: '/customers/1/orders/44051/cart/',
      responseBody: orderCartWithValidPrice,
    },
    { path: '/categories/', responseBody: categories },
    { path: '/categories/112/', responseBody: categoryDetail },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    vi.spyOn(window.history, 'state', 'get')
    vi.spyOn(window, 'open')
  })

  afterEach(() => {
    Storage.clear()
    vi.clearAllMocks()
  })

  it('should display the SCA failed alert and do not display the draft alert', async () => {
    Storage.setItem('failed_auth_payment_modal', { hasAlreadySeen: true })

    const responses = [
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
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: PaymentAuthenticationMother.redsysCard(),
      },
    ]
    const mountApp = () =>
      wrap(App)
        .atPath('/orders/44051/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()
    mountApp()

    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()
    await screen.findByTestId('sca-form')

    scaChallengeError(mountApp)
    const challengeErrorModal = await screen.findByLabelText(
      'The changes were not saved correctly',
    )
    expect(screen.getAllByRole('dialog')).toHaveLength(1)

    expect(challengeErrorModal).toHaveTextContent(
      'It looks like there was a problem with the authorization. You can try with another card or contact us through the Help chat.',
    )
    expect(challengeErrorModal).toHaveTextContent('Try again')
    expect(challengeErrorModal).toHaveTextContent(
      'Close without saving changes',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
      status: 'failed',
      user_flow: 'edit_order',
      payment_authentication_uuid: 'sca_id',
    })
  })

  it('should display the SCA failed alert', async () => {
    const responses = [
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
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: PaymentAuthenticationMother.redsysCard(),
      },
    ]
    const mountApp = () =>
      wrap(App)
        .atPath('/orders/44051/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()
    mountApp()

    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()
    await screen.findByTestId('sca-form')

    scaChallengeError(mountApp)
    const challengeErrorModal = await screen.findByLabelText(
      'The changes were not saved correctly',
    )

    expect(challengeErrorModal).toHaveTextContent(
      'The changes were not saved correctly',
    )
    expect(challengeErrorModal).toHaveTextContent(
      'It looks like there was a problem with the authorization. You can try with another card or contact us through the Help chat.',
    )
    expect(challengeErrorModal).toHaveTextContent('Try again')
    expect(challengeErrorModal).toHaveTextContent(
      'Close without saving changes',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
      status: 'failed',
      user_flow: 'edit_order',
      payment_authentication_uuid: 'sca_id',
    })
  })

  it('should go home if the authorization fails and the user cancels the edition', async () => {
    const responses = [
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
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: PaymentAuthenticationMother.redsysCard(),
      },
      {
        path: '/customers/1/orders/44051/cart/draft/',
        method: 'delete',
        requestBody: undefined,
      },
      {
        path: '/customers/1/orders/44051/cart/draft/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { quantity: 1, product_id: '8731', sources: ['+CT'] },
            { id: 1, quantity: 20, product_id: '3317', sources: [] },
            { id: 2, quantity: 3, product_id: '71502', sources: [] },
          ],
        },
      },
      {
        path: '/customers/1/orders/44051/cart/draft/',
        responseBody: {},
      },
    ]
    const mountApp = () =>
      wrap(App)
        .atPath('/orders/44051/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()
    mountApp()

    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()
    await screen.findByTestId('sca-form')

    scaChallengeError(mountApp)
    const challengeErrorModal = await screen.findByLabelText(
      'The changes were not saved correctly',
    )
    closeSCAWithoutSaving()

    await screen.findByText('Novedades')

    expect(challengeErrorModal).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'failed_authentication_alert_close_click',
      {
        flow: 'edit_order',
      },
    )
    expect(Storage.getItem('sca_confirm')).toBeUndefined()
    expect('/customers/1/orders/44051/cart/draft/').toHaveBeenFetchedWith({
      method: 'DELETE',
      body: {},
    })
  })

  it('should be able to check the payment method when SCA fails', async () => {
    const responses = [
      ...defaultResponses,
      {
        path: '/customers/1/orders/44051/cart/',
        method: 'put',
        multipleResponses: [
          { status: 418, responseBody: paymentAuthenticationRequired },
          { status: 200, responseBody: orderCartWithValidPrice },
        ],
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
            PaymentMethodMother.bizum(false),
          ],
        },
      },
      {
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: PaymentAuthenticationMother.redsysCard(),
      },
      {
        method: 'put',
        path: '/customers/1/orders/44051/payment-method/',
        requestBody: { payment_method: { id: 4687 } },
      },
      {
        path: '/customers/1/orders/44051/lines/prepared/',
        responseBody: preparedLines,
      },
    ]
    const mountApp = () =>
      wrap(App)
        .atPath('/orders/44051/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()
    mountApp()

    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()
    await screen.findByTestId('sca-form')

    scaChallengeError(mountApp)
    await screen.findByText('The changes were not saved correctly')
    tryAnotherPaymentMethod()
    const paymentMethodModal = await screen.findByRole('dialog')

    expect(
      await within(paymentMethodModal).findByRole('radio', {
        name: 'Visa, **** 6017, Expires 01/23',
      }),
    ).toHaveAttribute('aria-checked', 'true')
    expect(
      await within(paymentMethodModal).findByRole('radio', {
        name: 'Mastercard, **** 6023, Expires 01/23',
      }),
    ).toHaveAttribute('aria-checked', 'false')
    expect(
      await within(paymentMethodModal).findByRole('radio', {
        name: 'Bizum, +34 700000000, Bizum',
      }),
    ).toHaveAttribute('aria-checked', 'false')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'payment_methods_modal_view',
      {
        order_id: undefined,
        payment_method_ids: [4721, 4720, 4722],
      },
    )
    expect(Support.showButton).toHaveBeenCalledTimes(1)
    expect(Support.hideButton).toHaveBeenCalledTimes(1)
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'failed_authentication_alert_retry_click',
      {
        flow: 'edit_order',
      },
    )
  })

  it('should display the error message after a tokenization error without 3DS', async () => {
    window.location = {
      origin: 'https://tienda.mercadona.es',
      host: 'tienda.mercadona.es',
      protocol: 'https:',
    }
    const responses = [
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
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: PaymentAuthenticationMother.redsysCard(),
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
    ]
    const mountApp = (responses) =>
      wrap(App)
        .atPath('/orders/44051/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()

    mountApp(responses)

    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()
    await screen.findByTestId('sca-form')
    scaChallengeError(() => mountApp(responses))
    await screen.findByText('The changes were not saved correctly')
    tryAnotherPaymentMethod()
    await screen.findByText('Use a different card for this order')

    await clickToAddNewPaymentMethod()
    await selectNewPaymentMethodCard()
    await screen.findByTitle('payment-card-tpv-iframe')
    rejectAddPaymentMethod()

    const dialog = await screen.findByRole('dialog', {
      name: 'The changes were not saved correctly',
    })

    expect(dialog).toHaveTextContent(
      'It looks like there was a problem with the authorization. You can try with another card or contact us through the Help chat.',
    )
  })

  it('should be able cancel the change payment method step', async () => {
    const responses = [
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
        path: '/customers/1/payment-cards/auth/sca_id/',
        responseBody: PaymentAuthenticationMother.redsysCard(),
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
    ]
    const responsesAfterSCA = [
      { path: '/customers/1/orders/44051/', responseBody: order },
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
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]

    const mountApp = (responses) =>
      wrap(App)
        .atPath('/orders/44051/edit/products')
        .withNetwork(responses)
        .withLogin()
        .mount()

    mountApp(responses)

    await screen.findByText('Modify order')
    incrementProductInCart()
    confirmOrderEdition()
    await screen.findByTestId('sca-form')

    scaChallengeError(() => mountApp(responsesAfterSCA))
    await screen.findByText('The changes were not saved correctly')
    tryAnotherPaymentMethod()
    await screen.findByRole('dialog')
    cancelChangePayment()

    expect(
      screen.queryByText('Use a different card for this order'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('The changes were not saved correctly'),
    ).not.toBeInTheDocument()
  })
})
