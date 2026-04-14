import {
  act,
  cleanup,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'

import {
  authoriseMitTermsModal,
  tryAgainAfterGenericPaymentError,
} from './helpers'
import userEvent from '@testing-library/user-event'
import { monitoring } from 'monitoring'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  CheckoutAlreadyConfirmedException,
  CheckoutAuthState,
} from 'app/checkout'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { PaymentTPV, PhoneWithoutBizumException } from 'app/payment'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import {
  clickToAddNewPaymentMethod,
  clickToModifyPaymentMethod,
  fillBizumForm,
  selectNewPaymentMethodBizum,
  selectNewPaymentMethodCard,
} from 'pages/__tests__/helper'
import {
  confirmCheckout,
  continueCheckoutWithTokenAuth,
} from 'pages/__tests__/helpers/checkout'
import {
  cancelMitTermsModal,
  clickToCancelPaymentAuthenticating,
  closeSCAWithoutSaving,
  continueWithSCA,
  findPaymentMethodSection,
  savePaymentMethod,
  selectExistentPaymentMethod,
} from 'pages/__tests__/helpers/payment'
import { confirmAddPaymentMethod, rejectAddPaymentMethod } from 'pages/helpers'
import { Cookie } from 'services/cookie'
import { knownFeatureFlags } from 'services/feature-flags'
import { NetworkError } from 'services/http'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

vi.mock(import('services/http'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    NetworkError: {
      ...originalModule.NetworkError,
      publish: vi.fn(),
    },
  }
})

const CHECKOUT_TPV_OK_URL = new URLSearchParams({
  status: 'success',
  payment_method: 'any',
  payment_flow: 'checkout',
  payment_authentication_uuid: 'checkout_authentication_uuid',
})
const CHECKOUT_TPV_KO_URL = new URLSearchParams({
  status: 'failure',
  payment_method: 'any',
  payment_flow: 'checkout',
  payment_authentication_uuid: 'checkout_authentication_uuid',
})

describe('Checkout - Payment with Bizum', () => {
  configure({
    changeRoute: history.push,
  })

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    Storage.setItem(STORAGE_KEYS.BIZUM_USED_DIALOG, {
      hasAlreadySeen: true,
    })
    activeFeatureFlags([
      knownFeatureFlags.CHECKOUT_NEW_CONFIRM_STRATEGY,
      knownFeatureFlags.CHECKOUT_BIZUM_TOKEN_AUTHN_REST_STRATEGY,
    ])
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    localStorage.clear()
    cleanup()
  })

  it('should show bizum as default payment method', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withBizum(),
        },
      ])
      .withLogin()
      .mount()

    const paymentMethodSection = await screen.findByRole('region', {
      name: 'Payment method',
    })

    expect(paymentMethodSection).toHaveTextContent('+34 700000000Bizum')
  })

  it('should refetch checkout data when payment method is changed', async () => {
    const originalCard = 'Visa **** 6017'
    const newCard = '**** 6023'

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            {
              responseBody: CheckoutMother.filled(),
            },
            {
              responseBody: {
                ...CheckoutMother.filled(),
                payment_method: PaymentMethodMother.creditCardMastercardValid(),
              },
            },
          ],
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [
              PaymentMethodMother.creditCardVisaValid(false),
              PaymentMethodMother.creditCardMastercardValid(true),
            ],
          },
        },
        {
          path: '/customers/1/checkouts/5/payment-method/',
          method: 'put',
          requestBody: {
            payment_method: {
              id: PaymentMethodMother.creditCardMastercardValid().id,
            },
          },
        },
      ])
      .withLogin()
      .mount()

    const paymentMethodSection = await screen.findByRole('region', {
      name: 'Payment method',
    })
    await within(paymentMethodSection).findByText('**** 6017')

    await clickToModifyPaymentMethod()
    await selectExistentPaymentMethod('Mastercard, **** 6023, Expires 01/23')
    savePaymentMethod()
    await within(paymentMethodSection).findByRole('button', { name: 'Modify' })

    expect(paymentMethodSection).toHaveTextContent(newCard)
    expect(paymentMethodSection).not.toHaveTextContent(originalCard)
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_payment_method_finished',
      {
        payment_digits: '**** 6023',
        payment_id: 4720,
      },
    )
    expect('/customers/1/checkouts/5/').toHaveBeenFetchedTimes(2)
  })

  it('should confirm a checkout with Bizum as payment method default', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            {
              responseBody: CheckoutMother.filled(),
            },
            {
              responseBody: CheckoutMother.withBizum(),
            },
            {
              responseBody: CheckoutMother.confirmed(),
            },
          ],
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [
              PaymentMethodMother.creditCardVisaValid(),
              PaymentMethodMother.bizum(),
            ],
          },
        },
        {
          path: '/customers/1/checkouts/5/payment-method/',
          method: 'put',
          requestBody: { payment_method: { id: 4722 } },
        },
        {
          path: '/customers/1/checkouts/5/confirm/',
          method: 'post',
          status: 201,
          responseBody: { order_id: OrderMother.DEFAULT_ORDER_ID },
        },
        {
          path: '/customers/1/orders/44051/',
          method: 'get',
          responseBody: OrderMother.confirmedWithBizum(),
        },
      ])
      .withLogin()
      .mount()

    const paymentMethodSection = await screen.findByRole('region', {
      name: 'Payment method',
    })

    await clickToModifyPaymentMethod()
    await selectExistentPaymentMethod('Bizum, +34 700000000, Bizum')
    savePaymentMethod()

    await within(paymentMethodSection).findByRole('button', { name: 'Modify' })
    await confirmCheckout()

    await screen.findByRole('region', {
      name: 'Order 44051 confirmed',
    })
  })

  it('should launch payment tpv onconfirm a checkout with Bizum with authentication_required', async () => {
    vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withBizum(),
        },
        {
          path: '/customers/1/payment-cards/?lang=en&wh=vlc1',
          responseBody: {
            results: [
              PaymentMethodMother.bizum(),
              PaymentMethodMother.creditCardVisaValid(),
            ],
          },
          catchParams: true,
        },
        {
          path: '/customers/1/checkouts/5/confirm/',
          method: 'post',
          status: 202,
          responseBody: {
            authentication_mode: 'redirection',
            authentication_uuid: 'checkout_authentication_uuid',
          },
        },
        {
          path: `/customers/1/checkouts/5/authentication/?${new URLSearchParams(
            {
              lang: 'en',
              wh: 'vlc1',
              authentication_uuid: 'checkout_authentication_uuid',
              ok_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_OK_URL}`,
              ko_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_KO_URL}`,
            },
          )}`,
          catchParams: true,
          responseBody: PaymentAuthenticationMother.redsysBizum(),
        },
      ])
      .withLogin()
      .mount()

    await confirmCheckout()
    await continueWithSCA()

    await waitFor(() => {
      expect(
        PaymentTPV.autoRedirectToPaymentAuth,
      ).toHaveBeenCalledExactlyOnceWith(
        PaymentAuthenticationMother.redsysBizum().params,
      )
    })
  })

  describe('Change New Payment Method', () => {
    it('should display new payment method sticky dialog', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.withBizum(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.creditCardMastercardValid(),
              ],
            },
          },
        ])
        .withLogin()
        .mount()

      await clickToModifyPaymentMethod()
      await clickToAddNewPaymentMethod()

      const dialogAddPaymentMethod = await screen.findByRole('dialog', {
        name: 'Add payment method',
      })

      expect(dialogAddPaymentMethod).toBeInTheDocument()
      expect(dialogAddPaymentMethod).toHaveTextContent(
        'Select a payment method',
      )
      expect(
        within(dialogAddPaymentMethod).getByRole('button', {
          name: 'Card',
        }),
      ).toBeInTheDocument()
      expect(
        within(dialogAddPaymentMethod).getByRole('button', {
          name: 'Bizum',
        }),
      ).toBeInTheDocument()
    })

    it('should show existent bizum payment method', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.withBizum(),
          },
          {
            path: '/customers/1/payment-cards/?lang=en&wh=vlc1',
            catchParams: true,
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

      await clickToModifyPaymentMethod()

      const paymentSection = screen.getByRole('region', {
        name: 'Payment method',
      })

      const bizumPaymentMethod = await within(paymentSection).findByRole(
        'radio',
        {
          name: 'Bizum, +34 700000000, Bizum',
        },
      )

      expect(bizumPaymentMethod).toBeInTheDocument()
    })

    describe('Change New Payment Method Bizum', () => {
      it('should display new payment method bizum form', async () => {
        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody: CheckoutMother.filled(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
          ])
          .withLogin()
          .mount()

        await clickToModifyPaymentMethod()
        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodBizum()

        const dialogAddPaymentMethod = screen.getByRole('dialog', {
          name: 'Add payment method',
        })

        const bizumPhoneNumber = await within(
          dialogAddPaymentMethod,
        ).findByRole('textbox', {
          name: 'Number',
        })

        expect(bizumPhoneNumber).toBeInTheDocument()
        expect(dialogAddPaymentMethod).toHaveTextContent('What is your Bizum?')
        expect(dialogAddPaymentMethod).toHaveTextContent(
          'Enter your phone number linked to Bizum',
        )
        expect(
          within(dialogAddPaymentMethod).getByRole('mark'),
        ).toHaveTextContent(
          "Your details are protected and the confirmation is made from your bank's app.",
        )
        expect(
          within(dialogAddPaymentMethod).getByRole('note'),
        ).toHaveTextContent(
          'Bizum will be saved as a payment method. You will be able to delete it when you wish from your account.',
        )
        expect(
          within(dialogAddPaymentMethod).getByRole('button', {
            name: 'Go back',
          }),
        ).toBeInTheDocument()
        expect(
          within(dialogAddPaymentMethod).getByRole('button', {
            name: 'Continue',
          }),
        ).toBeInTheDocument()
      })

      it('should show error message for invalid bizum number', async () => {
        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody: CheckoutMother.filled(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
            {
              path: '/customers/1/checkouts/5/payment-methods/bizum/',
              method: 'POST',
              requestBody: {
                phone_country_code: '34',
                phone_national_number: '600123456',
              },
              status: 400,
              responseBody: {
                errors: [PhoneWithoutBizumException.toJSON()],
              },
            },
          ])
          .withLogin()
          .mount()

        await clickToModifyPaymentMethod()
        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodBizum()

        await act(() => fillBizumForm())

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

      it('should redirect to order confirmed for checkout already confirmed exception', async () => {
        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              multipleResponses: [
                {
                  responseBody: CheckoutMother.filled(),
                },
                {
                  responseBody: CheckoutMother.confirmedWithBizum(),
                },
              ],
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
            {
              path: '/customers/1/checkouts/5/payment-methods/bizum/',
              method: 'POST',
              requestBody: {
                phone_country_code: '34',
                phone_national_number: '600123456',
              },
              status: 400,
              responseBody: {
                errors: [CheckoutAlreadyConfirmedException.toJSON()],
              },
            },
            {
              path: '/customers/1/orders/44051/',
              responseBody: OrderMother.confirmedWithBizum(),
            },
          ])
          .withLogin()
          .mount()

        await clickToModifyPaymentMethod()
        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodBizum()

        await act(() => fillBizumForm())

        await screen.findByRole('region', {
          name: 'Order 44051 confirmed',
        })

        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'order_confirmation_view',
          {
            order_id: 44051,
            price: '70.96',
          },
        )
      })

      it('should redirect to TPV on redirect strategy', async () => {
        vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody: CheckoutMother.filled(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
            {
              path: '/customers/1/checkouts/5/payment-methods/bizum/',
              method: 'POST',
              requestBody: {
                phone_country_code: '34',
                phone_national_number: '600123456',
              },
              status: 202,
              responseBody: {
                authentication_mode: 'redirection',
                authentication_uuid: 'checkout_authentication_uuid',
              },
            },
            {
              path: `/customers/1/checkouts/5/authentication/?${new URLSearchParams(
                {
                  lang: 'en',
                  wh: 'vlc1',
                  authentication_uuid: 'checkout_authentication_uuid',
                  ok_url: `http://localhost:3000/checkout/5?${new URLSearchParams(
                    {
                      status: 'success',
                      payment_method: 'any',
                      payment_flow: 'checkout',
                      payment_authentication_uuid:
                        'checkout_authentication_uuid',
                    },
                  )}`,
                  ko_url: `http://localhost:3000/checkout/5?${new URLSearchParams(
                    {
                      status: 'failure',
                      payment_method: 'any',
                      payment_flow: 'checkout',
                      payment_authentication_uuid:
                        'checkout_authentication_uuid',
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

        await clickToModifyPaymentMethod()
        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodBizum()

        await act(() => fillBizumForm())

        await continueWithSCA()

        await waitFor(() => {
          expect(
            PaymentTPV.autoRedirectToPaymentAuth,
          ).toHaveBeenCalledExactlyOnceWith(
            PaymentAuthenticationMother.redsysBizum().params,
          )
        })
      })

      it('should redirect to TPV on redirect strategy with SCA modal already seen', async () => {
        Storage.setCheckoutSCAModalAsSeen()
        vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody: CheckoutMother.filled(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
            {
              path: '/customers/1/checkouts/5/payment-methods/bizum/',
              method: 'POST',
              requestBody: {
                phone_country_code: '34',
                phone_national_number: '600123456',
              },
              status: 202,
              responseBody: {
                authentication_mode: 'redirection',
                authentication_uuid: 'checkout_authentication_uuid',
              },
            },
            {
              path: `/customers/1/checkouts/5/authentication/?${new URLSearchParams(
                {
                  lang: 'en',
                  wh: 'vlc1',
                  authentication_uuid: 'checkout_authentication_uuid',
                  ok_url: `http://localhost:3000/checkout/5?${new URLSearchParams(
                    {
                      status: 'success',
                      payment_method: 'any',
                      payment_flow: 'checkout',
                      payment_authentication_uuid:
                        'checkout_authentication_uuid',
                    },
                  )}`,
                  ko_url: `http://localhost:3000/checkout/5?${new URLSearchParams(
                    {
                      status: 'failure',
                      payment_method: 'any',
                      payment_flow: 'checkout',
                      payment_authentication_uuid:
                        'checkout_authentication_uuid',
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

        await clickToModifyPaymentMethod()
        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodBizum()

        await act(() => fillBizumForm())

        await waitFor(() => {
          expect(
            PaymentTPV.autoRedirectToPaymentAuth,
          ).toHaveBeenCalledExactlyOnceWith(
            PaymentAuthenticationMother.redsysBizum().params,
          )
        })
      })

      it('should redirect to TPV on redirect strategy with checkout without payment method', async () => {
        vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody: CheckoutMother.withoutPaymentMethod(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [],
              },
            },
            {
              path: '/customers/1/checkouts/5/payment-methods/bizum/',
              method: 'POST',
              requestBody: {
                phone_country_code: '34',
                phone_national_number: '600123456',
              },
              status: 202,
              responseBody: {
                authentication_mode: 'redirection',
                authentication_uuid: 'checkout_authentication_uuid',
              },
            },
            {
              path: `/customers/1/checkouts/5/authentication/?${new URLSearchParams(
                {
                  lang: 'en',
                  wh: 'vlc1',
                  authentication_uuid: 'checkout_authentication_uuid',
                  ok_url: `http://localhost:3000/checkout/5?${new URLSearchParams(
                    {
                      status: 'success',
                      payment_method: 'any',
                      payment_flow: 'checkout',
                      payment_authentication_uuid:
                        'checkout_authentication_uuid',
                    },
                  )}`,
                  ko_url: `http://localhost:3000/checkout/5?${new URLSearchParams(
                    {
                      status: 'failure',
                      payment_method: 'any',
                      payment_flow: 'checkout',
                      payment_authentication_uuid:
                        'checkout_authentication_uuid',
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

        await continueCheckoutWithTokenAuth()
        await authoriseMitTermsModal()
        await selectNewPaymentMethodBizum()

        await act(() => fillBizumForm())

        await continueWithSCA()

        await waitFor(() => {
          expect(
            PaymentTPV.autoRedirectToPaymentAuth,
          ).toHaveBeenCalledExactlyOnceWith(
            PaymentAuthenticationMother.redsysBizum().params,
          )
        })
      })

      it('should confirm with REST authentication strategy', async () => {
        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody: CheckoutMother.filled(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
            {
              path: '/customers/1/checkouts/5/payment-methods/bizum/',
              method: 'POST',
              requestBody: {
                phone_country_code: '34',
                phone_national_number: '600123456',
              },
              status: 202,
              responseBody: {
                authentication_mode: 'rest',
              },
            },
            {
              path: '/customers/1/checkouts/5/confirm/',
              method: 'post',
              multipleResponses: [
                {
                  status: 201,
                  responseBody: {
                    order_id: OrderMother.DEFAULT_ORDER_ID,
                  },
                },
              ],
            },
            {
              path: '/customers/1/checkouts/5/status/',
              multipleResponses: [
                {
                  responseBody: {
                    state: CheckoutAuthState.NOT_CONFIRMED,
                  },
                },
                {
                  responseBody: {
                    state: CheckoutAuthState.PROCESSING_AUTHENTICATION,
                  },
                },
                {
                  responseBody: {
                    state: CheckoutAuthState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: CheckoutAuthState.CONFIRMED,
                  },
                },
              ],
            },
            {
              path: '/customers/1/checkouts/5/authentication-detail/',
              responseBody: {
                remaining_time: 120,
                estimated_amount: '49.99',
                total_amount: '49.99',
                has_variable_weight: false,
              },
            },
            {
              path: '/customers/1/orders/44051/',
              responseBody: OrderMother.confirmedWithBizum(),
            },
          ])
          .withLogin()
          .mount()

        await clickToModifyPaymentMethod()
        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodBizum()

        const bizumFormModal = await screen.findByRole('dialog', {
          name: 'Add payment method',
        })

        await act(async () => {
          await fillBizumForm()
          await waitForElementToBeRemoved(bizumFormModal)
        })

        const loadingDialog = await screen.findByRole('dialog', {
          name: 'Connecting with your bank',
        })
        await waitForElementToBeRemoved(loadingDialog)

        const authenticatingDialog = await screen.findByRole('dialog', {
          name: 'Open your banking app to authorise €49.99',
        })
        await waitForElementToBeRemoved(authenticatingDialog)

        await waitFor(() => {
          expect('/customers/1/checkouts/5/status/').toHaveBeenFetchedTimes(4) // 1 on load + 3 on polling
        })

        await screen.findByRole('region', {
          name: 'Order 44051 confirmed',
        })
      })

      it('should confirm with REST authentication strategy when is the first payment method', async () => {
        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody: CheckoutMother.withoutPaymentMethod(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [],
              },
            },
            {
              path: '/customers/1/checkouts/5/payment-methods/bizum/',
              method: 'POST',
              requestBody: {
                phone_country_code: '34',
                phone_national_number: '600123456',
              },
              status: 202,
              responseBody: {
                authentication_mode: 'rest',
              },
            },
            {
              path: '/customers/1/checkouts/5/confirm/',
              method: 'post',
              multipleResponses: [
                {
                  status: 201,
                  responseBody: {
                    order_id: OrderMother.DEFAULT_ORDER_ID,
                  },
                },
              ],
            },
            {
              path: '/customers/1/checkouts/5/status/',
              multipleResponses: [
                {
                  responseBody: {
                    state: CheckoutAuthState.NOT_CONFIRMED,
                  },
                },
                {
                  responseBody: {
                    state: CheckoutAuthState.PROCESSING_AUTHENTICATION,
                  },
                },
                {
                  responseBody: {
                    state: CheckoutAuthState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: CheckoutAuthState.CONFIRMED,
                  },
                },
              ],
            },
            {
              path: '/customers/1/checkouts/5/authentication-detail/',
              responseBody: {
                remaining_time: 120,
                estimated_amount: '49.99',
                total_amount: '49.99',
                has_variable_weight: false,
              },
            },
            {
              path: '/customers/1/orders/44051/',
              responseBody: OrderMother.confirmedWithBizum(),
            },
          ])
          .withLogin()
          .mount()

        await continueCheckoutWithTokenAuth()
        await authoriseMitTermsModal()

        const addPaymentMethodModal = await screen.findByRole('dialog', {
          name: 'Add payment method',
        })
        await selectNewPaymentMethodBizum()

        await act(async () => {
          await fillBizumForm()
          await waitForElementToBeRemoved(addPaymentMethodModal)
        })

        const loadingDialog = await screen.findByRole('dialog', {
          name: 'Connecting with your bank',
        })
        await waitForElementToBeRemoved(loadingDialog)

        const authenticatingDialog = await screen.findByRole('dialog', {
          name: 'Open your banking app to authorise €49.99',
        })
        await waitForElementToBeRemoved(authenticatingDialog)

        await waitFor(() => {
          expect('/customers/1/checkouts/5/status/').toHaveBeenFetchedTimes(4) // 1 on load + 3 on polling
        })

        await screen.findByRole('region', {
          name: 'Order 44051 confirmed',
        })
      })

      describe('Auth TPV callbacks', () => {
        it('should support ok response with confirmed checkout', async () => {
          wrap(App)
            .atPath(
              `/checkout/5?${new URLSearchParams({
                status: 'success',
                payment_method: 'bizum',
                payment_authentication_uuid: 'checkout_authentication_uuid',
                payment_flow: 'update_checkout_payment_method',
              })}`,
            )
            .withNetwork([
              {
                path: '/customers/1/checkouts/5/',
                responseBody: CheckoutMother.confirmedWithBizum(),
              },
              {
                path: `/customers/1/orders/44051/`,
                responseBody: OrderMother.confirmedWithBizum(),
              },
            ])
            .withLogin()
            .mount()

          await screen.findByRole('region', {
            name: 'Order 44051 confirmed',
          })

          expect(Tracker.sendInteraction).toHaveBeenCalledWith(
            'order_confirmation_view',
            {
              order_id: 44051,
              price: '70.96',
            },
          )
        })

        it('should support ok response without confirmed checkout that should reconfirm manually', async () => {
          wrap(App)
            .atPath(
              `/checkout/5?${new URLSearchParams({
                status: 'success',
                payment_method: 'bizum',
                payment_authentication_uuid: 'checkout_authentication_uuid',
                payment_flow: 'update_checkout_payment_method',
              })}`,
            )
            .withNetwork([
              {
                path: '/customers/1/checkouts/5/',
                multipleResponses: [
                  {
                    responseBody: CheckoutMother.withBizum(),
                  },
                  {
                    responseBody: CheckoutMother.confirmed(),
                  },
                ],
              },
              {
                path: '/customers/1/payment-cards/',
                responseBody: {
                  results: [
                    PaymentMethodMother.creditCardMastercardValid(false),
                    PaymentMethodMother.bizum(),
                  ],
                },
              },
              {
                path: '/customers/1/checkouts/5/confirm/',
                method: 'post',
                status: 201,
                responseBody: { order_id: OrderMother.DEFAULT_ORDER_ID },
              },
              {
                path: `/customers/1/orders/44051/`,
                responseBody: OrderMother.confirmedWithBizum(),
              },
            ])
            .withLogin()
            .mount()

          await waitFor(() => {
            expect('/customers/1/checkouts/5/confirm/').toHaveBeenFetched()
          })

          await screen.findByRole('region', {
            name: 'Order 44051 confirmed',
          })
        })

        it('should show an error message on ko', async () => {
          wrap(App)
            .atPath(
              `/checkout/5?${new URLSearchParams({
                status: 'failure',
                payment_method: 'bizum',
                payment_authentication_uuid: 'checkout_authentication_uuid',
                payment_flow: 'update_checkout_payment_method',
              })}`,
            )
            .withNetwork([
              {
                path: '/customers/1/checkouts/5/',
                responseBody: CheckoutMother.filled(),
              },
              {
                path: '/customers/1/payment-cards/',
                responseBody: {
                  results: [PaymentMethodMother.creditCardMastercardValid()],
                },
              },
            ])
            .withLogin()
            .mount()

          await screen.findByRole('dialog', {
            name: 'The transaction could not be carried out',
          })

          expect(Tracker.sendInteraction).toHaveBeenCalledWith(
            'end_psd2_flow',
            {
              payment_authentication_uuid: 'checkout_authentication_uuid',
              status: 'failed',
              user_flow: 'checkout',
            },
          )
        })
      })
    })

    describe('Change New Payment Method Card without always autoconfirm', () => {
      it('should display new payment method card form', async () => {
        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody: CheckoutMother.filled(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
            {
              path: '/customers/1/payment-cards/new/',
              responseBody: PaymentAuthenticationMother.redsysCard(),
            },
          ])
          .withLogin()
          .mount()

        await clickToModifyPaymentMethod()
        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodCard()

        const dialogAddPaymentMethod = screen.getByRole('dialog', {
          name: 'Add payment method',
        })

        const disclaimer = within(dialogAddPaymentMethod).getByRole('mark')
        const iframe = await within(dialogAddPaymentMethod).findByTitle(
          'payment-card-tpv-iframe',
        )
        const [annotationPaymentMethodsCards, annotationPaymentMethodSaves] =
          within(dialogAddPaymentMethod).getAllByRole('note')

        const annotationCards = within(
          annotationPaymentMethodsCards.parentElement!,
        ).getAllByRole('img')
        const [visaCard, masterCard, maestroCard] = annotationCards

        expect(dialogAddPaymentMethod).toHaveTextContent('Card')
        expect(disclaimer).toHaveTextContent(
          'Upon saving the card, open your banking app opens to authorise the operation',
        )
        expect(iframe).toBeInTheDocument()
        expect(annotationPaymentMethodsCards).toHaveTextContent(
          'Accepted cards',
        )
        expect(annotationCards).toHaveLength(3)
        expect(visaCard).toHaveAttribute('alt', 'Visa')
        expect(masterCard).toHaveAttribute('alt', 'Mastercard')
        expect(maestroCard).toHaveAttribute('alt', 'Maestro')
        expect(annotationPaymentMethodSaves).toHaveTextContent(
          'The card will be saved as a payment method. You will be able to delete it when you wish from your account.',
        )
      })

      describe('Auth TPV callbacks', () => {
        it('should show an error message on ko and close it', async () => {
          wrap(App)
            .atPath('/checkout/5')
            .withNetwork([
              {
                path: '/customers/1/checkouts/5/',
                responseBody: CheckoutMother.filled(),
              },
              {
                path: '/customers/1/payment-cards/',
                responseBody: {
                  results: [PaymentMethodMother.creditCardMastercardValid()],
                },
              },
              {
                path: '/customers/1/payment-cards/new/',
                responseBody: PaymentAuthenticationMother.redsysCard(),
              },
            ])
            .withLogin()
            .mount()

          await clickToModifyPaymentMethod()
          await clickToAddNewPaymentMethod()
          await selectNewPaymentMethodCard()

          const dialogAddPaymentMethod = await screen.findByRole('dialog', {
            name: 'Add payment method',
          })

          await screen.findByTitle('payment-card-tpv-iframe')
          rejectAddPaymentMethod()

          const paymentFailedDialog = await screen.findByRole('dialog', {
            name: 'The transaction could not be carried out',
          })

          expect(paymentFailedDialog).toBeInTheDocument()
          expect(paymentFailedDialog).toHaveTextContent(
            'The transaction could not be carried out',
          )

          const closeButton = within(paymentFailedDialog).getByRole('button', {
            name: 'Close',
          })

          userEvent.click(closeButton)

          await waitFor(() => {
            expect(dialogAddPaymentMethod).not.toBeInTheDocument()
            expect(paymentFailedDialog).not.toBeInTheDocument()
          })
        })

        it('should show an error message on ko and retry', async () => {
          wrap(App)
            .atPath('/checkout/5')
            .withNetwork([
              {
                path: '/customers/1/checkouts/5/',
                responseBody: CheckoutMother.filled(),
              },
              {
                path: '/customers/1/payment-cards/',
                responseBody: {
                  results: [PaymentMethodMother.creditCardMastercardValid()],
                },
              },
              {
                path: '/customers/1/payment-cards/new/',
                responseBody: PaymentAuthenticationMother.redsysCard(),
              },
            ])
            .withLogin()
            .mount()

          await clickToModifyPaymentMethod()
          await clickToAddNewPaymentMethod()
          await selectNewPaymentMethodCard()

          const redsysIframe = await screen.findByTitle(
            'payment-card-tpv-iframe',
          )
          rejectAddPaymentMethod()

          const paymentFailedDialog = await screen.findByRole('dialog', {
            name: 'The transaction could not be carried out',
          })

          expect(paymentFailedDialog).toBeInTheDocument()
          expect(paymentFailedDialog).toHaveTextContent(
            'The transaction could not be carried out',
          )

          const retryButton = within(paymentFailedDialog).getByRole('button', {
            name: 'Retry',
          })

          userEvent.click(retryButton)

          await waitFor(() => {
            expect(paymentFailedDialog).not.toBeInTheDocument()
            expect(redsysIframe).toBeInTheDocument()
          })
        })
      })
    })

    describe('Change New Payment Method Card', () => {
      beforeEach(() => {
        activeFeatureFlags([
          knownFeatureFlags.CHECKOUT_NEW_CARD_ALWAYS_AUTO_CONFIRM,
          knownFeatureFlags.CHECKOUT_NEW_CONFIRM_STRATEGY,
        ])
      })

      it('should display new payment method card form', async () => {
        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody: CheckoutMother.filled(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
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

        await clickToModifyPaymentMethod()
        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodCard()

        const dialogAddPaymentMethod = screen.getByRole('dialog', {
          name: 'Add payment method',
        })

        const disclaimer = within(dialogAddPaymentMethod).getByRole('mark')
        const iframe = await within(dialogAddPaymentMethod).findByTitle(
          'payment-card-tpv-iframe',
        )
        const [annotationPaymentMethodsCards, annotationPaymentMethodSaves] =
          within(dialogAddPaymentMethod).getAllByRole('note')

        const annotationCards = within(
          annotationPaymentMethodsCards.parentElement!,
        ).getAllByRole('img')
        const [visaCard, masterCard, maestroCard] = annotationCards

        expect(dialogAddPaymentMethod).toHaveTextContent('Card')
        expect(disclaimer).toHaveTextContent(
          'Upon saving the card, open your banking app opens to authorise the operation',
        )
        expect(iframe).toBeInTheDocument()
        expect(annotationPaymentMethodsCards).toHaveTextContent(
          'Accepted cards',
        )
        expect(annotationCards).toHaveLength(3)
        expect(visaCard).toHaveAttribute('alt', 'Visa')
        expect(masterCard).toHaveAttribute('alt', 'Mastercard')
        expect(maestroCard).toHaveAttribute('alt', 'Maestro')
        expect(annotationPaymentMethodSaves).toHaveTextContent(
          'The card will be saved as a payment method. You will be able to delete it when you wish from your account.',
        )
      })

      it('should redirect to error on ko', async () => {
        Object.defineProperty(window, 'location', {
          value: {
            ...window.location,
            href: 'http://localhost:3000/checkout/5',
            replace: vi.fn(),
          },
          writable: true,
        })

        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody: CheckoutMother.filled(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
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

        await clickToModifyPaymentMethod()
        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodCard()

        await screen.findByTitle('payment-card-tpv-iframe')
        rejectAddPaymentMethod()

        expect(window.location.replace).toHaveBeenCalledWith(
          `http://localhost:3000/checkout/5?${new URLSearchParams({
            status: 'failure',
            payment_method: 'card',
            payment_flow: 'checkout_auto_confirm',
            payment_authentication_storage_key:
              '10000000-1000-4000-8000-100000000000',
          })}`,
        )
      })

      it('should redirect to success on ok', async () => {
        Object.defineProperty(window, 'location', {
          value: {
            ...window.location,
            href: 'http://localhost:3000/checkout/5',
            replace: vi.fn(),
          },
          writable: true,
        })

        wrap(App)
          .atPath('/checkout/5')
          .withNetwork([
            {
              path: '/customers/1/checkouts/5/',
              responseBody: CheckoutMother.filled(),
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
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

        await clickToModifyPaymentMethod()
        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodCard()

        await screen.findByTitle('payment-card-tpv-iframe')
        confirmAddPaymentMethod()

        expect(window.location.replace).toHaveBeenCalledWith(
          `http://localhost:3000/checkout/5?${new URLSearchParams({
            status: 'success',
            payment_method: 'card',
            payment_flow: 'checkout_auto_confirm',
            payment_authentication_storage_key:
              '10000000-1000-4000-8000-100000000000',
          })}`,
        )
      })

      describe('Auth TPV callbacks', () => {
        it('should show an error message on ko and close it', async () => {
          localStorage.setItem('10000000-1000-4000-8000-100000000000', 'uuid')

          wrap(App)
            .withLogin()
            .atPath(
              `/checkout/5?${new URLSearchParams({
                status: 'failure',
                payment_method: 'card',
                payment_flow: 'checkout_auto_confirm',
                payment_authentication_storage_key:
                  '10000000-1000-4000-8000-100000000000',
              })}`,
            )
            .withNetwork([
              {
                path: '/customers/1/checkouts/5/',
                responseBody: CheckoutMother.filled(),
              },
              {
                path: '/customers/1/payment-cards/',
                responseBody: {
                  results: [PaymentMethodMother.creditCardMastercardValid()],
                },
              },
            ])
            .mount()

          const paymentFailedDialog = await screen.findByRole('dialog', {
            name: 'The transaction could not be carried out',
          })

          const closeButton = within(paymentFailedDialog).getByRole('button', {
            name: 'Close',
          })

          userEvent.click(closeButton)

          await waitFor(() => {
            expect(paymentFailedDialog).not.toBeInTheDocument()
          })
        })

        it('should show an error message on ko and retry', async () => {
          localStorage.setItem('10000000-1000-4000-8000-100000000000', 'uuid')

          wrap(App)
            .withLogin()
            .atPath(
              `/checkout/5?${new URLSearchParams({
                status: 'failure',
                payment_method: 'card',
                payment_flow: 'checkout_auto_confirm',
                payment_authentication_storage_key:
                  '10000000-1000-4000-8000-100000000000',
              })}`,
            )
            .withNetwork([
              {
                path: '/customers/1/checkouts/5/',
                responseBody: CheckoutMother.filled(),
              },
              {
                path: '/customers/1/payment-cards/',
                responseBody: {
                  results: [PaymentMethodMother.creditCardMastercardValid()],
                },
              },
            ])
            .mount()

          const paymentFailedDialog = await screen.findByRole('dialog', {
            name: 'The transaction could not be carried out',
          })

          expect(paymentFailedDialog).toBeInTheDocument()
          expect(paymentFailedDialog).toHaveTextContent(
            'The transaction could not be carried out',
          )

          const retryButton = within(paymentFailedDialog).getByRole('button', {
            name: 'Retry',
          })

          userEvent.click(retryButton)

          await waitFor(() => {
            expect(paymentFailedDialog).not.toBeInTheDocument()
          })
        })

        it('should redirect to confirmed on success and checkout is confirmed', async () => {
          localStorage.setItem('10000000-1000-4000-8000-100000000000', 'uuid')

          wrap(App)
            .withLogin()
            .atPath(
              `/checkout/5?${new URLSearchParams({
                status: 'success',
                payment_method: 'card',
                payment_flow: 'checkout_auto_confirm',
                payment_authentication_storage_key:
                  '10000000-1000-4000-8000-100000000000',
              })}`,
            )
            .withNetwork([
              {
                path: '/customers/1/checkouts/5/',
                responseBody: CheckoutMother.confirmed(),
              },
              {
                path: '/customers/1/payment-cards/',
                responseBody: {
                  results: [PaymentMethodMother.creditCardMastercardValid()],
                },
              },
              {
                path: '/customers/1/orders/44051/',
                responseBody: OrderMother.confirmed(),
              },
            ])
            .mount()

          await screen.findByRole('region', {
            name: 'Order 44051 confirmed',
          })
        })

        it('should reconfirm to success but checkout not confirmed', async () => {
          localStorage.setItem('10000000-1000-4000-8000-100000000000', 'uuid')

          wrap(App)
            .atPath(
              `/checkout/5?${new URLSearchParams({
                status: 'success',
                payment_method: 'card',
                payment_flow: 'checkout_auto_confirm',
                payment_authentication_storage_key:
                  '10000000-1000-4000-8000-100000000000',
              })}`,
            )
            .withNetwork([
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
                path: '/customers/1/orders/44051/',
                responseBody: OrderMother.confirmedWithBizum(),
              },
              {
                path: '/customers/1/checkouts/5/confirm/',
                method: 'post',
                status: 201,
                responseBody: {
                  order_id: OrderMother.DEFAULT_ORDER_ID,
                },
              },
            ])
            .withLogin()
            .mount()

          await waitFor(() => {
            expect('/customers/1/checkouts/5/confirm/').toHaveBeenFetched()
          })

          await screen.findByRole('region', {
            name: 'Order 44051 confirmed',
          })
        })
      })
    })
  })

  describe('Auth TPV callbacks', () => {
    it('should redirect to success order details on authentication success', async () => {
      vi.spyOn(history, 'push')
      vi.spyOn(window.history, 'replaceState')

      wrap(App)
        .atPath(`/checkout/5?${CHECKOUT_TPV_OK_URL}`)
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            multipleResponses: [
              {
                responseBody: CheckoutMother.withBizum(),
              },
              {
                responseBody: CheckoutMother.confirmed(),
              },
            ],
          },
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmedWithBizum(),
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            status: 201,
            responseBody: { order_id: OrderMother.DEFAULT_ORDER_ID },
          },
        ])
        .withLogin()
        .mount()

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
        payment_authentication_uuid: 'checkout_authentication_uuid',
      })
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'order_confirmation_view',
        {
          order_id: 44051,
          price: '70.96',
        },
      )
    })

    it('should show an error message on ko and close it', async () => {
      wrap(App)
        .atPath(`/checkout/5?${CHECKOUT_TPV_KO_URL}`)
        .withNetwork([
          { path: '/customers/1/orders/', responseBody: { results: [] } },
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.withBizum(),
          },
          {
            path: '/customers/1/payment-cards/?lang=en&wh=vlc1',
            responseBody: {
              results: [
                PaymentMethodMother.bizum(),
                PaymentMethodMother.creditCardVisaValid(),
              ],
            },
            catchParams: true,
          },
        ])
        .withLogin()
        .mount()

      const paymentFailedDialog = await screen.findByRole('dialog', {
        name: 'The transaction could not be carried out',
      })

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'authentication_failed_alert_view',
      )

      closeSCAWithoutSaving()

      expect(
        screen.getByRole('button', { name: 'Confirm order' }),
      ).toBeInTheDocument()

      expect(paymentFailedDialog).not.toBeInTheDocument()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'authentication_failed_alert_dismiss',
      )
    })

    it('should show an error message on ko and retry it', async () => {
      wrap(App)
        .atPath(`/checkout/5?${CHECKOUT_TPV_KO_URL}`)
        .withNetwork([
          { path: '/customers/1/orders/', responseBody: { results: [] } },
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.withBizum(),
          },
          {
            path: '/customers/1/payment-cards/?lang=en&wh=vlc1',
            responseBody: {
              results: [
                PaymentMethodMother.bizum(),
                PaymentMethodMother.creditCardVisaValid(),
              ],
            },
            catchParams: true,
          },
        ])
        .withLogin()
        .mount()

      const paymentFailedDialog = await screen.findByRole('dialog', {
        name: 'The transaction could not be carried out',
      })

      tryAgainAfterGenericPaymentError()

      const paymentMethodSection = await findPaymentMethodSection()

      const currentPaymentMethodButton = within(paymentMethodSection).getByRole(
        'radio',
        {
          name: 'Bizum, +34 700000000, Bizum',
        },
      )
      const visaPaymentMethodButton = within(paymentMethodSection).getByRole(
        'radio',
        {
          name: 'Visa, **** 6017, Expires 01/23',
        },
      )

      expect(paymentFailedDialog).not.toBeInTheDocument()
      expect(paymentMethodSection).toBeInTheDocument()
      expect(currentPaymentMethodButton).toBeInTheDocument()
      expect(visaPaymentMethodButton).toBeInTheDocument()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'authentication_failed_alert_retry_click',
      )
    })

    it('should be able to retry it changing the payment method and confirm to some that already exist on authentication failure', async () => {
      wrap(App)
        .atPath(`/checkout/5?${CHECKOUT_TPV_KO_URL}`)
        .withNetwork([
          { path: '/customers/1/orders/', responseBody: { results: [] } },
          {
            path: '/customers/1/checkouts/5/',
            multipleResponses: [
              {
                responseBody: CheckoutMother.withBizum(),
              },
              {
                responseBody: CheckoutMother.withBizum(),
              },
              {
                responseBody: CheckoutMother.confirmed(),
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/payment-method/',
            method: 'PUT',
            requestBody: {
              payment_method: {
                id: PaymentMethodMother.creditCardVisaValid().id,
              },
            },
          },
          {
            path: '/customers/1/payment-cards/?lang=en&wh=vlc1',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(false),
                PaymentMethodMother.bizum(true),
              ],
            },
            catchParams: true,
          },
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmed(),
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            status: 201,
            responseBody: { order_id: OrderMother.DEFAULT_ORDER_ID },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByRole('dialog', {
        name: 'The transaction could not be carried out',
      })

      tryAgainAfterGenericPaymentError()

      await selectExistentPaymentMethod('Visa, **** 6017, Expires 01/23')
      savePaymentMethod()
      await confirmCheckout()

      await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })
    })
  })

  describe('With auto confirm on create first payment method', () => {
    it('should show new payment method modal on first checkout', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withLogin()
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.withoutPaymentMethod(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [],
            },
          },
        ])
        .mount()

      await continueCheckoutWithTokenAuth()
      await authoriseMitTermsModal()

      const addPaymentMethodModal = await screen.findByRole('dialog', {
        name: 'Add payment method',
      })

      expect(addPaymentMethodModal).toBeInTheDocument()
    })
  })

  describe('Retry payment with REST', () => {
    it('should confirm with REST authentication strategy', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            multipleResponses: [
              {
                status: 202,
                responseBody: {
                  authentication_mode: 'rest',
                },
              },
              {
                status: 201,
                responseBody: {
                  order_id: OrderMother.DEFAULT_ORDER_ID,
                },
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.CONFIRMED,
                },
              },
            ],
          },
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmedWithBizum(),
          },
        ])
        .withLogin()
        .mount()

      await confirmCheckout()

      await waitFor(() => {
        expect('/customers/1/checkouts/5/status/').toHaveBeenFetchedTimes(2) // 1 on load + 1 on polling
      })
      await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })
    })

    it('should reactivate polling for payment status on processing_authentication', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.PROCESSING_AUTHENTICATION,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.PROCESSING_AUTHENTICATION,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATION_FAILED,
                },
              },
            ],
          },
        ])
        .withLogin()
        .mount()

      const pageLoader = await screen.findByLabelText(
        'Connecting with your bank',
      )

      await waitForElementToBeRemoved(pageLoader)
      expect('/customers/1/checkouts/5/status/').toHaveBeenFetchedTimes(3) // 1 on load + 2 on polling (2 pending, 1 failed to stop polling)
    })

    it('should reactivate polling for payment status on authenticating', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATION_FAILED,
                },
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/authentication-detail/',
            responseBody: {
              remaining_time: 120,
              estimated_amount: '49.99',
              total_amount: '49.99',
              has_variable_weight: false,
            },
          },
        ])
        .withLogin()
        .mount()

      const authenticatingDialog = await screen.findByRole('dialog', {
        name: 'Open your banking app to authorise €49.99',
      })

      await waitForElementToBeRemoved(authenticatingDialog)
      expect('/customers/1/checkouts/5/status/').toHaveBeenFetchedTimes(3) // 1 on load + 2 on polling (2 pending, 1 failed to stop polling)
    })

    it('should confirm with REST authentication and show authenticating modal without variable weight', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            multipleResponses: [
              {
                status: 202,
                responseBody: {
                  authentication_mode: 'rest',
                },
              },
              {
                status: 201,
                responseBody: {
                  order_id: OrderMother.DEFAULT_ORDER_ID,
                },
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/authentication-detail/',
            responseBody: {
              remaining_time: 120,
              estimated_amount: '49.99',
              total_amount: '49.99',
              has_variable_weight: false,
            },
          },
        ])
        .withLogin()
        .mount()

      await confirmCheckout()

      const authenticatingModal = await screen.findByRole('dialog', {
        name: 'Open your banking app to authorise €49.99',
      })

      const modalTitle = within(authenticatingModal).getByRole('heading', {
        level: 3,
        name: 'Open your banking app to authorise €49.99',
      })

      expect(modalTitle).toBeInTheDocument()
      expect(authenticatingModal).toHaveTextContent('Time remaining01min59sec')
      expect(authenticatingModal).toHaveTextContent('Amount to authorise€49.99')
      expect(authenticatingModal).toHaveTextContent(
        'This is not a payment, just an authorisation',
      )
      expect(authenticatingModal).toHaveTextContent(
        'The final amount will be charged on the day of delivery, after the products have been prepared.',
      )
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('psd2_modal_view', {
        time_left: 120,
        has_extra_to_authenticate: false,
      })
    })

    it('should confirm with REST authentication and show authenticating modal with variable weight', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            multipleResponses: [
              {
                status: 202,
                responseBody: {
                  authentication_mode: 'rest',
                },
              },
              {
                status: 201,
                responseBody: {
                  order_id: OrderMother.DEFAULT_ORDER_ID,
                },
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/authentication-detail/',
            responseBody: {
              remaining_time: 120,
              estimated_amount: '49.50',
              margin_amount: '10.21',
              total_amount: '60.11',
              has_variable_weight: true,
            },
          },
        ])
        .withLogin()
        .mount()

      await confirmCheckout()

      const authenticatingModal = await screen.findByRole('dialog', {
        name: 'Open your banking app to authorise €60.11',
      })

      const modalTitle = within(authenticatingModal).getByRole('heading', {
        level: 3,
        name: 'Open your banking app to authorise €60.11',
      })

      expect(modalTitle).toBeInTheDocument()
      expect(authenticatingModal).toHaveTextContent('Time remaining01min59sec')
      expect(authenticatingModal).toHaveTextContent('Estimated total€49.50')
      expect(authenticatingModal).toHaveTextContent(
        'Margin on products sold by weight (fruit, meat, fish…)€10.21',
      )
      expect(authenticatingModal).toHaveTextContent('Amount to authorise€60.11')
      expect(authenticatingModal).toHaveTextContent(
        'This is not a payment, just an authorisation',
      )
      expect(authenticatingModal).toHaveTextContent(
        'The exact total will be charged on the day of delivery, after the products have been weighed and prepared.',
      )
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('psd2_modal_view', {
        time_left: 120,
        has_extra_to_authenticate: true,
      })
    })

    it('should confirm with REST authentication and authentication fails', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            multipleResponses: [
              {
                status: 202,
                responseBody: {
                  authentication_mode: 'rest',
                },
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.PROCESSING_AUTHENTICATION,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATION_FAILED,
                },
              },
            ],
          },
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmedWithBizum(),
          },
          {
            path: '/customers/1/checkouts/5/authentication-detail/',
            responseBody: {
              remaining_time: 120,
              estimated_amount: '49.99',
              total_amount: '49.99',
              has_variable_weight: false,
            },
          },
        ])
        .withLogin()
        .mount()

      await confirmCheckout()

      const loadingDialog = await screen.findByRole('dialog', {
        name: 'Connecting with your bank',
      })
      await waitForElementToBeRemoved(loadingDialog)

      const authenticatingDialog = await screen.findByRole('dialog', {
        name: 'Open your banking app to authorise €49.99',
      })
      await waitForElementToBeRemoved(authenticatingDialog)
      await screen.findByRole('dialog', {
        name: 'The transaction could not be carried out',
      })

      await waitFor(() => {
        expect('/customers/1/checkouts/5/status/').toHaveBeenFetchedTimes(4) // 1 on load + 3 on polling
        expect('/customers/1/checkouts/5/confirm/').toHaveBeenFetchedTimes(1) // 1 on confirm + 0 on reconfirm
        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'authentication_failed_alert_view',
        )
      })
    })

    it('should confirm with REST authentication and not confirmed', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            multipleResponses: [
              {
                status: 202,
                responseBody: {
                  authentication_mode: 'rest',
                },
              },
              {
                status: 400,
                responseBody: {
                  errors: [
                    {
                      code: 'unknown_error',
                      detail: 'An unknown error occurred.',
                    },
                  ],
                },
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.PROCESSING_AUTHENTICATION,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
            ],
          },
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmedWithBizum(),
          },
          {
            path: '/customers/1/checkouts/5/authentication-detail/',
            responseBody: {
              remaining_time: 120,
              estimated_amount: '49.99',
              total_amount: '49.99',
              has_variable_weight: false,
            },
          },
        ])
        .withLogin()
        .mount()

      await confirmCheckout()

      const loadingDialog = await screen.findByRole('dialog', {
        name: 'Connecting with your bank',
      })
      await waitForElementToBeRemoved(loadingDialog)

      const authenticatingDialog = await screen.findByRole('dialog', {
        name: 'Open your banking app to authorise €49.99',
      })
      await waitForElementToBeRemoved(authenticatingDialog)

      await waitFor(() => {
        expect('/customers/1/checkouts/5/status/').toHaveBeenFetchedTimes(4) // 1 on load + 3 on polling
        expect('/customers/1/checkouts/5/confirm/').toHaveBeenFetchedTimes(2) // 1 on confirm + 1 on reconfirm
        expect(NetworkError.publish).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 400,
          }),
        )
      })
    })

    it('should confirm with REST authentication and confirmed', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            multipleResponses: [
              {
                status: 202,
                responseBody: {
                  authentication_mode: 'rest',
                },
              },
              {
                status: 201,
                responseBody: {
                  order_id: OrderMother.DEFAULT_ORDER_ID,
                },
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.PROCESSING_AUTHENTICATION,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.CONFIRMED,
                },
              },
            ],
          },
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmedWithBizum(),
          },
          {
            path: '/customers/1/checkouts/5/authentication-detail/',
            responseBody: {
              remaining_time: 120,
              estimated_amount: '49.99',
              total_amount: '49.99',
              has_variable_weight: false,
            },
          },
        ])
        .withLogin()
        .mount()

      await confirmCheckout()

      const loadingDialog = await screen.findByRole('dialog', {
        name: 'Connecting with your bank',
      })
      await waitForElementToBeRemoved(loadingDialog)

      const authenticatingDialog = await screen.findByRole('dialog', {
        name: 'Open your banking app to authorise €49.99',
      })
      await waitForElementToBeRemoved(authenticatingDialog)

      await waitFor(() => {
        expect('/customers/1/checkouts/5/status/').toHaveBeenFetchedTimes(4) // 1 on load + 3 on polling
        expect('/customers/1/checkouts/5/confirm/').toHaveBeenFetchedTimes(2) // 1 on confirm + 1 on reconfirm
      })

      const orderConfirmed = await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })

      expect(orderConfirmed).toBeInTheDocument()
    })

    it('should confirm with REST authentication and confirmed with network errors', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            multipleResponses: [
              {
                status: 202,
                responseBody: {
                  authentication_mode: 'rest',
                },
              },
              {
                status: 201,
                responseBody: {
                  order_id: OrderMother.DEFAULT_ORDER_ID,
                },
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.PROCESSING_AUTHENTICATION,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
              },
              {
                status: 500,
              },
              {
                responseBody: {
                  state: CheckoutAuthState.CONFIRMED,
                },
              },
            ],
          },
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmedWithBizum(),
          },
          {
            path: '/customers/1/checkouts/5/authentication-detail/',
            responseBody: {
              remaining_time: 120,
              estimated_amount: '49.99',
              total_amount: '49.99',
              has_variable_weight: false,
            },
          },
        ])
        .withLogin()
        .mount()

      await confirmCheckout()

      const loadingDialog = await screen.findByRole('dialog', {
        name: 'Connecting with your bank',
      })
      await waitForElementToBeRemoved(loadingDialog)

      const authenticatingDialog = await screen.findByRole('dialog', {
        name: 'Open your banking app to authorise €49.99',
      })
      await waitForElementToBeRemoved(authenticatingDialog, { timeout: 2000 })

      await waitFor(() => {
        expect('/customers/1/checkouts/5/status/').toHaveBeenFetchedTimes(5) // 1 on load + 4 on polling
        expect('/customers/1/checkouts/5/confirm/').toHaveBeenFetchedTimes(2) // 1 on confirm + 1 on reconfirm
      })

      const orderConfirmed = await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })

      expect(orderConfirmed).toBeInTheDocument()
    })

    it('should confirm with REST authentication and confirmed with unknown state', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            multipleResponses: [
              {
                status: 202,
                responseBody: {
                  authentication_mode: 'rest',
                },
              },
              {
                status: 201,
                responseBody: {
                  order_id: OrderMother.DEFAULT_ORDER_ID,
                },
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.PROCESSING_AUTHENTICATION,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
              },
              {
                responseBody: {
                  state: 'UNKNOWN_STATE',
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.CONFIRMED,
                },
              },
            ],
          },
          {
            path: '/customers/1/orders/44051/',
            responseBody: OrderMother.confirmedWithBizum(),
          },
          {
            path: '/customers/1/checkouts/5/authentication-detail/',
            responseBody: {
              remaining_time: 120,
              estimated_amount: '49.99',
              total_amount: '49.99',
              has_variable_weight: false,
            },
          },
        ])
        .withLogin()
        .mount()

      await confirmCheckout()

      const loadingDialog = await screen.findByRole('dialog', {
        name: 'Connecting with your bank',
      })
      await waitForElementToBeRemoved(loadingDialog)

      const authenticatingDialog = await screen.findByRole('dialog', {
        name: 'Open your banking app to authorise €49.99',
      })
      await waitForElementToBeRemoved(authenticatingDialog, { timeout: 2000 })

      await waitFor(() => {
        expect('/customers/1/checkouts/5/status/').toHaveBeenFetchedTimes(5) // 1 on load + 4 on polling
        expect('/customers/1/checkouts/5/confirm/').toHaveBeenFetchedTimes(2) // 1 on confirm + 1 on reconfirm
        expect(monitoring.sendMessage).toHaveBeenCalledWith(
          'Unknown checkout authentication REST state',
          {
            state: 'UNKNOWN_STATE',
          },
        )
      })

      const orderConfirmed = await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      })

      expect(orderConfirmed).toBeInTheDocument()
    })

    it('should confirm with REST authentication and cancel', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            status: 202,
            responseBody: {
              authentication_mode: 'rest',
            },
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/authentication-detail/',
            responseBody: {
              remaining_time: 120,
              estimated_amount: '49.99',
              total_amount: '49.99',
              has_variable_weight: false,
            },
          },
          {
            path: '/customers/1/checkouts/5/authentication/cancel/',
            method: 'PUT',
            status: 204,
            delay: 1000,
          },
        ])
        .withLogin()
        .mount()

      await confirmCheckout()

      const authenticatingDialog = await screen.findByRole('dialog', {
        name: 'Open your banking app to authorise €49.99',
      })

      clickToCancelPaymentAuthenticating()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('psd2_cancel_click')
      expect(authenticatingDialog).not.toBeInTheDocument()
      const processingModal = await screen.findByLabelText(
        'Connecting with your bank',
      )
      await waitForElementToBeRemoved(processingModal)

      const paymentFailedModal = await screen.findByRole('dialog', {
        name: 'The transaction could not be carried out',
      })
      expect(paymentFailedModal).toBeInTheDocument()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'authentication_failed_alert_view',
      )

      await waitFor(() => {
        expect(
          '/customers/1/checkouts/5/authentication/cancel/',
        ).toHaveBeenFetched()

        expect('/customers/1/checkouts/5/status/').toHaveBeenFetchedTimes(2) // 1 on load + 1 on polling (1 authenticating) then stopped after cancel
      })

      expect(
        screen.getByRole('button', { name: 'Confirm order' }),
      ).toBeInTheDocument()
    })

    it('should confirm with REST authentication and cancel without race conditions', async () => {
      vi.useFakeTimers()

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            status: 202,
            responseBody: {
              authentication_mode: 'rest',
            },
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.AUTHENTICATING,
                },
                delay: 1000,
              },
            ],
          },
          {
            path: '/customers/1/checkouts/5/authentication-detail/',
            responseBody: {
              remaining_time: 120,
              estimated_amount: '49.99',
              total_amount: '49.99',
              has_variable_weight: false,
            },
          },
          {
            path: '/customers/1/checkouts/5/authentication/cancel/',
            method: 'PUT',
            status: 204,
            delay: 1000,
          },
        ])
        .withLogin()
        .mount()

      await confirmCheckout()

      const authenticatingModal = await screen.findByRole('dialog', {
        name: 'Open your banking app to authorise €49.99',
      })

      vi.advanceTimersByTime(1000)
      clickToCancelPaymentAuthenticating()

      expect(authenticatingModal).not.toBeInTheDocument()
      const processingModal = await screen.findByLabelText(
        'Connecting with your bank',
      )

      vi.advanceTimersByTime(1000)
      await waitForElementToBeRemoved(processingModal)

      await screen.findByRole('dialog', {
        name: 'The transaction could not be carried out',
      })

      vi.advanceTimersByTime(5000)

      const authenticatingModalByRaceProblems = screen.queryByRole('dialog', {
        name: 'Open your banking app to authorise €49.99',
      })

      expect(authenticatingModalByRaceProblems).not.toBeInTheDocument()
      expect('/customers/1/checkouts/5/status/').toHaveBeenFetchedTimes(3) // 1 on load + 2 on polling (1 authenticating + 1 authenticating returned after cancel) then stopped after cancel

      vi.useRealTimers()
    })

    it('should redirect to webview when initial status check returns fallback_required', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/checkouts/5/status/',
            responseBody: {
              state: CheckoutAuthState.FALLBACK_REQUIRED,
              authentication_uuid: 'checkout_authentication_uuid',
            },
          },
          {
            path: `/customers/1/checkouts/5/authentication/?${new URLSearchParams(
              {
                lang: 'en',
                wh: 'vlc1',
                authentication_uuid: 'checkout_authentication_uuid',
                ok_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_OK_URL}`,
                ko_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_KO_URL}`,
              },
            )}`,
            catchParams: true,
            responseBody: PaymentAuthenticationMother.redsysBizum(),
          },
        ])
        .withLogin()
        .mount()

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
            type: 'authentication',
            provider: 'redsys',
            payment_authentication_uuid: 'checkout_authentication_uuid',
            user_flow: 'checkout',
            is_MIT: false,
          },
        )
      })
    })

    it('should redirect to webview when polling returns fallback_required on confirm checkout REST', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            status: 202,
            responseBody: {
              authentication_mode: 'rest',
            },
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.FALLBACK_REQUIRED,
                  authentication_uuid: 'checkout_authentication_uuid',
                },
              },
            ],
          },
          {
            path: `/customers/1/checkouts/5/authentication/?${new URLSearchParams(
              {
                lang: 'en',
                wh: 'vlc1',
                authentication_uuid: 'checkout_authentication_uuid',
                ok_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_OK_URL}`,
                ko_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_KO_URL}`,
              },
            )}`,
            catchParams: true,
            responseBody: PaymentAuthenticationMother.redsysBizum(),
          },
        ])
        .withLogin()
        .mount()

      await confirmCheckout()

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
            type: 'authentication',
            provider: 'redsys',
            payment_authentication_uuid: 'checkout_authentication_uuid',
            user_flow: 'checkout',
            is_MIT: false,
          },
        )
      })
    })

    it('should redirect to webview when polling returns fallback_required on updatePaymentMethodWithBizum', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [PaymentMethodMother.creditCardMastercardValid()],
            },
          },
          {
            path: '/customers/1/checkouts/5/payment-methods/bizum/',
            method: 'POST',
            requestBody: {
              phone_country_code: '34',
              phone_national_number: '600123456',
            },
            status: 202,
            responseBody: {
              authentication_mode: 'rest',
            },
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.FALLBACK_REQUIRED,
                  authentication_uuid: 'checkout_authentication_uuid',
                },
              },
            ],
          },
          {
            path: `/customers/1/checkouts/5/authentication/?${new URLSearchParams(
              {
                lang: 'en',
                wh: 'vlc1',
                authentication_uuid: 'checkout_authentication_uuid',
                ok_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_OK_URL}`,
                ko_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_KO_URL}`,
              },
            )}`,
            catchParams: true,
            responseBody: PaymentAuthenticationMother.redsysBizum(),
          },
        ])
        .withLogin()
        .mount()

      await clickToModifyPaymentMethod()
      await clickToAddNewPaymentMethod()
      await selectNewPaymentMethodBizum()

      const bizumFormModal = await screen.findByRole('dialog', {
        name: 'Add payment method',
      })

      await act(async () => {
        await fillBizumForm()
        await waitForElementToBeRemoved(bizumFormModal)
      })

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
            payment_authentication_uuid: 'checkout_authentication_uuid',
            user_flow: 'checkout',
            is_MIT: false,
          },
        )
      })
    })

    it('should call cancelAuthentication when MIT Terms Modal is cancelled after initial status check returns mit_required', async () => {
      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/checkouts/5/status/',
            responseBody: {
              state: CheckoutAuthState.MIT_REQUIRED,
              authentication_uuid: 'checkout_authentication_uuid',
            },
          },
          {
            path: '/customers/1/checkouts/5/authentication/cancel/',
            method: 'PUT',
            status: 204,
            delay: 1000,
          },
        ])
        .withLogin()
        .mount()

      const mitModal = await screen.findByRole('dialog', {
        name: 'Authorisation required',
      })
      cancelMitTermsModal()

      const loader = await screen.findByLabelText('Connecting with your bank')
      await waitForElementToBeRemoved(loader)

      expect(mitModal).not.toBeInTheDocument()

      await waitFor(() => {
        expect(
          '/customers/1/checkouts/5/authentication/cancel/',
        ).toHaveBeenFetched()
      })
    })

    it('should show MIT Terms Modal, close it and redirect with isMIT=true when polling returns mit_required on confirm checkout REST', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.bizum(true),
              ],
            },
          },
          {
            path: '/customers/1/checkouts/5/confirm/',
            method: 'post',
            status: 202,
            responseBody: {
              authentication_mode: 'rest',
            },
          },
          {
            path: '/customers/1/checkouts/5/status/',
            multipleResponses: [
              {
                responseBody: {
                  state: CheckoutAuthState.NOT_CONFIRMED,
                },
              },
              {
                responseBody: {
                  state: CheckoutAuthState.MIT_REQUIRED,
                  authentication_uuid: 'checkout_authentication_uuid',
                },
              },
            ],
          },
          {
            path: `/customers/1/checkouts/5/authentication/?${new URLSearchParams(
              {
                lang: 'en',
                wh: 'vlc1',
                authentication_uuid: 'checkout_authentication_uuid',
                ok_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_OK_URL}`,
                ko_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_KO_URL}`,
              },
            )}`,
            catchParams: true,
            responseBody: PaymentAuthenticationMother.redsysBizum(),
          },
        ])
        .withLogin()
        .mount()

      await confirmCheckout()

      const mitModal = await screen.findByRole('dialog', {
        name: 'Authorisation required',
      })
      authoriseMitTermsModal()

      expect(mitModal).not.toBeInTheDocument()
      await screen.findByRole('dialog', { name: 'Connecting with your bank' })

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
            type: 'authentication',
            provider: 'redsys',
            payment_authentication_uuid: 'checkout_authentication_uuid',
            user_flow: 'checkout',
            is_MIT: true,
          },
        )
      })
    })

    it('should show MIT Terms Modal, close it and redirect with isMIT=true when initial status check returns mit_required', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

      wrap(App)
        .atPath('/checkout/5')
        .withNetwork([
          {
            path: '/customers/1/checkouts/5/',
            responseBody: CheckoutMother.filled(),
          },
          {
            path: '/customers/1/checkouts/5/status/',
            responseBody: {
              state: CheckoutAuthState.MIT_REQUIRED,
              authentication_uuid: 'checkout_authentication_uuid',
            },
          },
          {
            path: `/customers/1/checkouts/5/authentication/?${new URLSearchParams(
              {
                lang: 'en',
                wh: 'vlc1',
                authentication_uuid: 'checkout_authentication_uuid',
                ok_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_OK_URL}`,
                ko_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_KO_URL}`,
              },
            )}`,
            catchParams: true,
            responseBody: PaymentAuthenticationMother.redsysBizum(),
          },
        ])
        .withLogin()
        .mount()

      const mitModal = await screen.findByRole('dialog', {
        name: 'Authorisation required',
      })
      authoriseMitTermsModal()

      expect(mitModal).not.toBeInTheDocument()
      await screen.findByRole('dialog', { name: 'Connecting with your bank' })

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
            type: 'authentication',
            provider: 'redsys',
            payment_authentication_uuid: 'checkout_authentication_uuid',
            user_flow: 'checkout',
            is_MIT: true,
          },
        )
      })
    })
  })
})
