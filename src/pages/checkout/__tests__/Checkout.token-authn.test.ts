import { act, screen, waitFor, within } from '@testing-library/react'

import {
  authoriseMitTermsModal,
  cancelMitModal,
  closeModal,
  closeNotConfirmedModal,
  confirmTokenAuthnScaChallenge,
  failTokenAuthnScaChallenge,
  tryAgainAfterGenericPaymentError,
  tryAgainAfterPaymentError,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { mockDate } from 'app/delivery-area/__scenarios__/slots'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import {
  PaymentAuthenticationRequiredException,
  PaymentTPV,
  PhoneWithoutBizumException,
} from 'app/payment'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import {
  closeNewPaymentMethodModal,
  fillBizumForm,
  selectNewPaymentMethodBizum,
  selectNewPaymentMethodCard,
} from 'pages/__tests__/helper'
import { continueCheckoutWithTokenAuth } from 'pages/__tests__/helpers/checkout'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const CHECKOUT_AUTO_CONFIRM_TPV_OK_URL = new URLSearchParams({
  status: 'success',
  payment_method: 'bizum',
  payment_flow: 'checkout_auto_confirm',
  payment_authentication_uuid: 'checkout_autoconfirm_authentication_uuid',
})
const CHECKOUT_AUTO_CONFIRM_TPV_KO_URL = new URLSearchParams({
  status: 'failure',
  payment_method: 'bizum',
  payment_flow: 'checkout_auto_confirm',
  payment_authentication_uuid: 'checkout_autoconfirm_authentication_uuid',
})

describe('Checkout - Tokenization+Authentication flow', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const { resetMockDate } = mockDate()

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  afterAll(() => {
    resetMockDate()
  })

  it('uses the token+authn flow when the user has no payment method', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutPaymentMethod(),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('region', { name: 'Summary' })

    expect(screen.getByRole('region', { name: 'Delivery' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Phone' })).toBeInTheDocument()
    expect(
      screen.queryByRole('region', { name: 'Payment method' }),
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('mark', { name: /Once you have finalised your order/ }),
    ).toBeInTheDocument()
  })

  it('shows the MIT terms modal when you click on "Continue"', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutPaymentMethod(),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Summary')

    await continueCheckoutWithTokenAuth()

    const mitTermsModal = screen.getByRole('dialog', {
      name: 'Authorisation required',
    })

    expect(mitTermsModal).toBeInTheDocument()
    expect(mitTermsModal).toHaveTextContent('Authorisation required')
    expect(mitTermsModal).toHaveTextContent(
      'We need you to authorise the payment of this order, including possible changes you may make and products with variable weight.By authorising, you allow us to charge the final amount on the delivery day, in accordance with the payment conditions.',
    )
    expect(
      within(mitTermsModal).getByRole('button', { name: 'Authorise' }),
    ).toBeInTheDocument()
    expect(
      within(mitTermsModal).getByRole('button', { name: 'Back unconfirmed' }),
    ).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('mit_term', {
      flow: 'tokenization_authentication',
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'finish_checkout_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        price: '75.46',
        is_valid: true,
        has_payment_method: false,
      },
    )
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('mit_term', {
      flow: 'tokenization_authentication',
    })
  })

  it('closes the MIT terms modal when you click on "Back unconfirmed"', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutPaymentMethod(),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Summary')
    await continueCheckoutWithTokenAuth()
    const mitTermsModal = screen.getByRole('dialog', {
      name: 'Authorisation required',
    })
    cancelMitModal()

    expect(mitTermsModal).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'mit_term_cancel_button_click',
    )
  })

  it('closes the payment modal when you click on the X button', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutPaymentMethod(),
        },
        { path: '/customers/1/orders/', responseBody: { results: [] } },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Summary')

    await continueCheckoutWithTokenAuth()
    await authoriseMitTermsModal()

    const addPaymentMethodModal = await screen.findByRole('dialog', {
      name: 'Add payment method',
    })

    await closeNewPaymentMethodModal()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'tokenization_authentication_form_closed_by_user',
    )
    expect(addPaymentMethodModal).not.toBeInTheDocument()

    const errorModal = await screen.findByRole('dialog', {
      name: 'Order not confirmed. We need you to authorise the card payment to be able to confirm your order.',
    })
    expect(errorModal).toHaveTextContent(
      'We need you to authorise the card payment to be able to confirm your order.',
    )

    closeNotConfirmedModal()

    expect(errorModal).not.toBeInTheDocument()
    expect(screen.getByText('Summary')).toBeInTheDocument()
  })

  it('opens the payment modal when you click on "Authorise" on the MIT terms modal', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutPaymentMethod(),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Summary')

    await continueCheckoutWithTokenAuth()
    authoriseMitTermsModal()

    await screen.findByRole('dialog', {
      name: 'Add payment method',
    })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'mit_term_accept_button_click',
    )
  })

  describe('Payment method Card', () => {
    it('request the correct parameters for the iframe for card', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.withoutPaymentMethod(),
          },
          { path: '/customers/1/orders/', responseBody: { results: [] } },
          {
            path: '/customers/1/checkouts/5/payment-cards/new/',
            method: 'post',
            requestBody: {
              ok_url: 'http://localhost:3000/sca_token_authn_ok.html',
              ko_url: 'http://localhost:3000/sca_token_authn_ko.html',
              checkout_auto_confirm: 'yes',
            },
            responseBody: PaymentAuthenticationMother.redsysCard(),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Summary')

      await continueCheckoutWithTokenAuth()
      authoriseMitTermsModal()

      await screen.findByRole('dialog', {
        name: 'Add payment method',
      })
      await selectNewPaymentMethodCard()

      expect(
        '/customers/1/checkouts/5/payment-cards/new/',
      ).toHaveBeenFetchedWith({
        method: 'POST',
        body: {
          ok_url: 'http://localhost:3000/sca_token_authn_ok.html',
          ko_url: 'http://localhost:3000/sca_token_authn_ko.html',
          checkout_auto_confirm: 'yes',
        },
      })

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'mit_term_accept_button_click',
      )
    })

    it('confirms the order when the authentication challenge succeeds', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            multipleResponses: [
              {
                responseBody: CheckoutMother.withoutPaymentMethod(),
              },
              {
                responseBody: CheckoutMother.confirmed(),
              },
            ],
          },
          { path: '/customers/1/orders/', responseBody: { results: [] } },
          {
            path: '/customers/1/checkouts/5/payment-cards/new/',
            method: 'post',
            requestBody: {
              ok_url: 'http://localhost:3000/sca_token_authn_ok.html',
              ko_url: 'http://localhost:3000/sca_token_authn_ko.html',
              checkout_auto_confirm: 'yes',
            },
            responseBody: PaymentAuthenticationMother.redsysCard(),
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
        ])
        .withLogin()
        .mount()

      await screen.findByText('Summary')

      expect(Tracker.sendInteraction).toHaveBeenCalledWith('summary_view', {
        has_payment_method: false,
      })

      await continueCheckoutWithTokenAuth()
      authoriseMitTermsModal()

      const dialogAddPaymentMethod = await screen.findByRole('dialog', {
        name: 'Add payment method',
      })
      await selectNewPaymentMethodCard()

      await within(dialogAddPaymentMethod).findByTitle(
        'payment-card-tpv-iframe',
      )

      act(() => confirmTokenAuthnScaChallenge())

      expect(
        screen.getByRole('dialog', { name: 'Confirming your order' }),
      ).toBeInTheDocument()

      await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('start_psd2_flow', {
        payment_method_type: 'card',
        type: 'tokenization_authentication',
        provider: 'redsys',
        payment_authentication_uuid: 'pa_redsys_card_uuid',
        user_flow: 'checkout',
        is_MIT: false,
      })

      expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
        status: 'success',
        user_flow: 'checkout',
        payment_authentication_uuid: 'pa_redsys_card_uuid',
      })
    })

    it('shows an error message modal when the authentication challenge fails', async () => {
      Storage.setPsd2AuthenticationUuid('sca_id')
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.withoutPaymentMethod(),
          },
          { path: '/customers/1/orders/', responseBody: { results: [] } },
          {
            path: '/customers/1/checkouts/5/payment-cards/new/',
            method: 'post',
            requestBody: {
              ok_url: 'http://localhost:3000/sca_token_authn_ok.html',
              ko_url: 'http://localhost:3000/sca_token_authn_ko.html',
              checkout_auto_confirm: 'yes',
            },
            responseBody: PaymentAuthenticationMother.redsysCard(),
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
        ])
        .withLogin()
        .mount()

      await screen.findByText('Summary')

      await continueCheckoutWithTokenAuth()
      authoriseMitTermsModal()

      const dialogAddPaymentMethod = await screen.findByRole('dialog', {
        name: 'Add payment method',
      })
      await selectNewPaymentMethodCard()

      await within(dialogAddPaymentMethod).findByTitle(
        'payment-card-tpv-iframe',
      )
      act(() => failTokenAuthnScaChallenge())

      const errorModal = await screen.findByRole('dialog', {
        name: 'We’re sorry, we couldn’t complete the order. It looks like there was a problem with the bank authorisation. You can try with another card or find more information in the Help section.',
      })
      expect(errorModal).toHaveTextContent(
        'It looks like there was a problem with the bank authorisation. You can try with another card or find more information in the Help section.',
      )
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
        status: 'failed',
        user_flow: 'checkout',
        payment_authentication_uuid: 'sca_id',
      })

      const closeButton = within(errorModal).getByRole('button', {
        name: 'Close',
      })
      const tryAgainButton = within(errorModal).getByRole('button', {
        name: 'Try again',
      })
      expect(closeButton).toBeInTheDocument()
      expect(tryAgainButton).toBeInTheDocument()
      expect(dialogAddPaymentMethod).not.toBeInTheDocument()

      tryAgainAfterPaymentError()

      await screen.findByRole('dialog', {
        name: 'Add payment method',
      })
      expect(errorModal).not.toBeInTheDocument()
    })

    it('displays an error message when the order confirmation fails', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.withoutPaymentMethod(),
          },
          { path: '/customers/1/orders/', responseBody: { results: [] } },
          {
            path: '/customers/1/checkouts/5/payment-cards/new/',
            method: 'post',
            requestBody: {
              ok_url: 'http://localhost:3000/sca_token_authn_ok.html',
              ko_url: 'http://localhost:3000/sca_token_authn_ko.html',
              checkout_auto_confirm: 'yes',
            },
            responseBody: PaymentAuthenticationMother.redsysCard(),
          },
          {
            path: '/customers/1/checkouts/5/orders/',
            method: 'post',
            status: 400,
            responseBody: {
              errors: [
                {
                  detail:
                    'El horario seleccionado no está disponible. Inténtalo de nuevo',
                  code: 'slot_taken',
                },
              ],
            },
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
        ])
        .withLogin()
        .mount()

      await screen.findByText('Summary')

      await continueCheckoutWithTokenAuth()
      authoriseMitTermsModal()

      const dialogAddPaymentMethod = await screen.findByRole('dialog', {
        name: 'Add payment method',
      })
      await selectNewPaymentMethodCard()

      await within(dialogAddPaymentMethod).findByTitle(
        'payment-card-tpv-iframe',
      )

      act(() => confirmTokenAuthnScaChallenge())

      const errorModal = await screen.findByRole('dialog', {
        name: 'Your request cannot be processed. El horario seleccionado no está disponible. Inténtalo de nuevo',
      })
      expect(dialogAddPaymentMethod).not.toBeInTheDocument()
      expect(errorModal).toHaveTextContent(
        'El horario seleccionado no está disponible. Inténtalo de nuevo',
      )
      const okButton = within(errorModal).getByRole('button', { name: 'OK' })
      expect(okButton).toBeInTheDocument()

      closeModal()

      expect(errorModal).not.toBeInTheDocument()
      expect(screen.getByText('Summary')).toBeInTheDocument()
    })

    it('should call endpoint with checkout_auto_confirm to yes', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.withoutPaymentMethod(),
          },
          { path: '/customers/1/orders/', responseBody: { results: [] } },
          {
            path: '/customers/1/checkouts/5/payment-cards/new/',
            method: 'post',
            requestBody: {
              ok_url: 'http://localhost:3000/sca_token_authn_ok.html',
              ko_url: 'http://localhost:3000/sca_token_authn_ko.html',
              checkout_auto_confirm: 'yes',
            },
            responseBody: PaymentAuthenticationMother.redsysCard(),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Summary')

      await continueCheckoutWithTokenAuth()
      authoriseMitTermsModal()

      const dialogAddPaymentMethod = await screen.findByRole('dialog', {
        name: 'Add payment method',
      })
      await selectNewPaymentMethodCard()

      await within(dialogAddPaymentMethod).findByTitle(
        'payment-card-tpv-iframe',
      )

      expect(
        '/customers/1/checkouts/5/payment-cards/new/',
      ).toHaveBeenFetchedWith({
        method: 'POST',
        body: {
          ok_url: 'http://localhost:3000/sca_token_authn_ok.html',
          ko_url: 'http://localhost:3000/sca_token_authn_ko.html',
          checkout_auto_confirm: 'yes',
        },
      })
    })
  })

  describe('Payment method Bizum', () => {
    it('shows phone without bizum when error phone_without_bizum exception', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.withoutPaymentMethod(),
          },
          {
            path: '/customers/1/checkouts/5/payment-method-bizum/',
            method: 'POST',
            requestBody: {
              phone_country_code: '34',
              phone_national_number: '600123456',
              checkout_auto_confirm: 'yes',
            },
            status: 400,
            responseBody: {
              errors: [PhoneWithoutBizumException.toJSON()],
            },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Summary')

      await continueCheckoutWithTokenAuth()
      authoriseMitTermsModal()

      await screen.findByRole('dialog', {
        name: 'Add payment method',
      })

      await selectNewPaymentMethodBizum()
      await fillBizumForm()

      const errorDialog = await screen.findByRole('dialog', {
        name: '+34 600 12 34 56 is not linked to Bizum',
      })

      expect(errorDialog).toBeInTheDocument()
      expect(errorDialog).toHaveTextContent(
        '+34 600 12 34 56 is not linked to Bizum',
      )
      expect(errorDialog).toHaveTextContent(
        'Make sure this phone number is linked to Bizum',
      )
    })

    it('shows generic error when unknown exception', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.withoutPaymentMethod(),
          },
          {
            path: '/customers/1/checkouts/5/payment-method-bizum/',
            method: 'POST',
            requestBody: {
              phone_country_code: '34',
              phone_national_number: '600123456',
              checkout_auto_confirm: 'yes',
            },
            status: 400,
            responseBody: {
              errors: [
                {
                  code: 'unknown_error',
                  detail: 'An unknown error has occurred',
                },
              ],
            },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Summary')

      await continueCheckoutWithTokenAuth()
      authoriseMitTermsModal()

      await screen.findByRole('dialog', {
        name: 'Add payment method',
      })

      await selectNewPaymentMethodBizum()
      await fillBizumForm()

      const errorDialog = await screen.findByRole('dialog', {
        name: 'Your request cannot be processed. An unknown error has occurred',
      })

      expect(errorDialog).toHaveTextContent('An unknown error has occurred')
    })

    it('should redirect to PaymentTPV on payment authentication required exception', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.withoutPaymentMethod(),
          },
          {
            path: '/customers/1/checkouts/5/payment-method-bizum/',
            method: 'POST',
            requestBody: {
              phone_country_code: '34',
              phone_national_number: '600123456',
              checkout_auto_confirm: 'yes',
            },
            status: 400,
            responseBody: {
              errors: [
                PaymentAuthenticationRequiredException.toJSON({
                  authentication_uuid:
                    'checkout_autoconfirm_authentication_uuid',
                }),
              ],
            },
          },
          {
            path: `/customers/1/checkouts/5/authentication/?${new URLSearchParams(
              {
                lang: 'en',
                wh: 'vlc1',
                authentication_uuid: 'checkout_autoconfirm_authentication_uuid',
                ok_url: `http://localhost:3000/checkout/5?${CHECKOUT_AUTO_CONFIRM_TPV_OK_URL}`,
                ko_url: `http://localhost:3000/checkout/5?${CHECKOUT_AUTO_CONFIRM_TPV_KO_URL}`,
              },
            )}`,
            catchParams: true,
            responseBody: PaymentAuthenticationMother.redsysBizum(),
          },
        ])
        .withLogin()
        .mount()

      await continueCheckoutWithTokenAuth()
      authoriseMitTermsModal()
      await screen.findByRole('dialog', {
        name: 'Add payment method',
      })
      await selectNewPaymentMethodBizum()
      await fillBizumForm()

      await waitFor(() => {
        expect(
          PaymentTPV.autoRedirectToPaymentAuth,
        ).toHaveBeenCalledExactlyOnceWith(
          PaymentAuthenticationMother.redsysBizum().params,
        )
        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'start_psd2_flow',
          {
            payment_method_type: 'bizum',
            type: 'tokenization_authentication',
            provider: 'redsys',
            payment_authentication_uuid:
              'checkout_autoconfirm_authentication_uuid',
            user_flow: 'checkout',
            is_MIT: false,
          },
        )
      })
    })

    describe('when returning from TPV', () => {
      it('shows an error message modal when the authentication challenge fails', async () => {
        wrap(App)
          .atPath(`/checkout/5?${CHECKOUT_AUTO_CONFIRM_TPV_KO_URL}`)
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody: CheckoutMother.withoutPaymentMethod(),
            },
            { path: '/customers/1/orders/', responseBody: { results: [] } },
          ])
          .withLogin()
          .mount()

        const errorModal = await screen.findByRole('dialog', {
          name: 'The transaction could not be carried out',
        })
        expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
          status: 'failed',
          user_flow: 'checkout',
          payment_authentication_uuid:
            'checkout_autoconfirm_authentication_uuid',
        })

        const closeButton = within(errorModal).getByRole('button', {
          name: 'Close',
        })
        const tryAgainButton = within(errorModal).getByRole('button', {
          name: 'Retry',
        })
        expect(closeButton).toBeInTheDocument()
        expect(tryAgainButton).toBeInTheDocument()

        tryAgainAfterGenericPaymentError()

        await screen.findByRole('dialog', {
          name: 'Add payment method',
        })
        expect(errorModal).not.toBeInTheDocument()
      })

      it('confirms the order when the authentication challenge succeeds', async () => {
        wrap(App)
          .atPath(`/checkout/5?${CHECKOUT_AUTO_CONFIRM_TPV_OK_URL}`)
          .withLogin()
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              multipleResponses: [
                {
                  responseBody: CheckoutMother.confirmed(),
                },
              ],
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
          ])
          .mount()

        await screen.findByRole('region', {
          name: 'Order 44051 confirmed',
        })
      })
    })
  })
})
