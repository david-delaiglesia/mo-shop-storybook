import { screen, waitFor, within } from '@testing-library/react'

import {
  closeCheckoutAuthModal,
  confirmCheckout,
  pageLoadedFromCache,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { checkout } from 'app/checkout/__scenarios__/checkout'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import { paymentAuthenticationRequired } from 'app/payment/__scenarios__/payments'
import {
  continueWithSCA,
  findPaymentMethodSection,
} from 'pages/__tests__/helpers/payment'
import {
  closeSCAWithoutSavingCheckout,
  scaChallengeError,
  scaChallengeSuccess,
  tryAnotherPaymentMethod,
} from 'pages/order-products/__tests__/helpers'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - SCA', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const responsesBeforeSCA = [
    {
      path: '/customers/1/checkouts/5/',
      responseBody: CheckoutMother.withSCA(),
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

  beforeEach(() => {
    history.replace('/')
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('displays the checkout authorisation modal the first time a user confirms a checkout', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork(responsesBeforeSCA)
      .withLogin()
      .mount()

    const authorisePaymentButton = await screen.findByRole('button', {
      name: 'Confirm order',
    })
    confirmCheckout()

    const modal = await screen.findByRole('dialog', {
      name: 'Important changes in online payment',
    })

    expect(modal).toHaveTextContent('Important changes in online payment')
    expect(modal).toHaveTextContent(
      'Now your bank may give you instructions for authorising the purchase amount on its website or app.',
    )
    expect(modal).toHaveTextContent(
      'You may have to authorise up to €5 more in case the price of the variable weight products ends up being higher.',
    )
    expect(modal).toHaveTextContent(
      "Remember, we'll only charge you the exact amount of the products served on the delivery day.",
    )
    expect(
      within(modal).getByRole('button', { name: 'Continue' }),
    ).toBeInTheDocument()
    expect(
      within(modal).getByRole('button', { name: 'Back' }),
    ).toBeInTheDocument()

    expect(
      within(authorisePaymentButton).getByLabelText('Loading'),
    ).toBeInTheDocument()

    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'new_payment_info_alert',
    )
  })

  it('allows to close the checkout authorization modal', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork(responsesBeforeSCA)
      .withLogin()
      .mount()

    const authorisePaymentButton = await screen.findByRole('button', {
      name: 'Confirm order',
    })
    confirmCheckout()
    const authModal = await screen.findByRole('dialog')

    expect(
      within(authorisePaymentButton).getByLabelText('Loading'),
    ).toBeInTheDocument()

    closeCheckoutAuthModal()

    expect(authModal).not.toBeInTheDocument()
    expect(
      within(authorisePaymentButton).queryByLabelText('Loading'),
    ).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'new_payment_info_alert_close_click',
    )
  })

  it('does not display the checkout authorisation modal the second time a user confirms a checkout', async () => {
    Storage.setCheckoutSCAModalAsSeen()
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork(responsesBeforeSCA)
      .withLogin()
      .mount()

    await screen.findByRole('button', { name: 'Confirm order' })
    confirmCheckout()
    await screen.findByTestId('sca-form')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(Tracker.sendViewChange).not.toHaveBeenCalledWith(
      'new_payment_info_alert',
    )
  })

  it('should start the authentication challenge', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork(responsesBeforeSCA)
      .withLogin()
      .mount()

    await screen.findByText('Delivery')
    confirmCheckout()
    await continueWithSCA()
    const iframeChallenge = await screen.findByTestId('sca-form')

    expect(iframeChallenge).toBeInTheDocument()

    expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
      'log_start_psd2_flow',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('start_psd2_flow', {
      payment_method_type: 'card',
      type: 'authentication',
      provider: 'redsys',
      payment_authentication_uuid: 'sca_id',
      user_flow: 'checkout',
      is_MIT: false,
    })
  })

  it('confirms a checkout with authentication challenge', async () => {
    vi.spyOn(Storage, 'setCheckoutSCAModalAsSeen')
    vi.spyOn(window.history, 'pushState')
    const responsesAfterSCA = [
      {
        path: '/customers/1/checkouts/5/',
        multipleResponses: [
          {
            responseBody: CheckoutMother.filled(),
          },
          {
            responseBody: CheckoutMother.confirmed(),
          },
        ],
      },
      {
        path: '/customers/1/checkouts/5/orders/',
        method: 'post',
        responseBody: CheckoutMother.confirmed(),
      },
      {
        path: '/customers/1/orders/44051/',
        responseBody: OrderMother.confirmed(),
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [],
        },
      },
    ]
    const mountApp = (responses) =>
      wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    mountApp(responsesBeforeSCA)

    const confirmButton = await screen.findByRole('button', {
      name: 'Confirm order',
    })
    confirmCheckout()

    expect(
      within(confirmButton).queryByLabelText('Loading'),
    ).toBeInTheDocument()

    await continueWithSCA()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'new_payment_info_alert_continue_click',
    )

    await screen.findByTestId('sca-form')

    scaChallengeSuccess(() => mountApp(responsesAfterSCA))

    await screen.findByRole('region', {
      name: 'Order 44051 confirmed',
    })

    expect(window.history.replaceState).toHaveBeenCalledWith(
      expect.objectContaining({ state: undefined }),
      null,
      '/purchases/44051/confirmation',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
      status: 'success',
      user_flow: 'checkout',
      payment_authentication_uuid: 'sca_id',
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'order_confirmation_view',
      {
        order_id: 44051,
        price: '70.96',
      },
    )
    expect(Storage.setCheckoutSCAModalAsSeen).toHaveBeenCalled()
  })

  it('after an error in the SCA challenge, displays the payment method selector', async () => {
    const responsesAfterSCA = [
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.filled(),
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
    ]
    const mountApp = (responses) =>
      wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    mountApp(responsesBeforeSCA)

    await screen.findByRole('button', { name: 'Confirm order' })
    confirmCheckout()
    await continueWithSCA()
    await screen.findByTestId('sca-form')

    scaChallengeError(() => mountApp(responsesAfterSCA))
    const errorModal = await screen.findByRole('dialog')

    expect(errorModal).toHaveTextContent(
      'We’re sorry, we couldn’t complete the order',
    )

    tryAnotherPaymentMethod()

    const paymentMethodSection = await findPaymentMethodSection()

    expect(
      await within(paymentMethodSection).findByRole('radio', {
        name: 'Mastercard, **** 6023, Expires 01/23',
      }),
    ).toHaveAttribute('aria-checked', 'false')
    expect(
      await within(paymentMethodSection).findByRole('radio', {
        name: 'Visa, **** 6017, Expires 01/23',
      }),
    ).toHaveAttribute('aria-checked', 'true')
  })

  it('handles a server error in the confirm checkout request', async () => {
    const responses = [
      { path: '/customers/1/checkouts/5/', responseBody: checkout },
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/orders/',
        method: 'post',
        status: 500,
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')
    confirmCheckout()
    await screen.findByText(
      'Sorry, the content of this page cannot be displayed.',
    )

    expect(screen.getByRole('link', { name: 'Go to shop' })).toBeInTheDocument()
  })

  it('after an error in the SCA challenge, allows to close the retry modal and remains in the checkout page', async () => {
    const responsesAfterSCA = [
      { path: '/customers/1/checkouts/5/', responseBody: checkout },
      { path: '/customers/1/orders/', responseBody: { results: [] } },
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
    closeSCAWithoutSavingCheckout()

    expect(
      screen.getByRole('button', { name: 'Confirm order' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'failed_authentication_alert_close_click',
      {
        flow: 'checkout',
      },
    )
  })

  it('should make a reload to prevent 404 bug on safari when going back on an ongoing challenge', async () => {
    delete global.window.location
    global.window.location = {
      reload: vi.fn(),
    }
    wrap(App)
      .atPath(
        '/sca_confirm_ko.html?url=https://local.tech.mercadona.es/checkout/5',
      )
      .mount()

    await waitFor(() => null)
    pageLoadedFromCache()

    expect(window.location.reload).toHaveBeenCalled()
  })
})
