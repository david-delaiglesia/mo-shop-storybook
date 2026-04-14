import { act, cleanup, screen, waitFor, within } from '@testing-library/react'

import { authoriseMitTermsModal } from './helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import {
  PaymentAuthenticationRequiredException,
  PaymentTPV,
  PhoneWithoutBizumException,
} from 'app/payment'
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
  closeSCAWithoutSaving,
  continueWithSCA,
  findPaymentMethodSection,
  savePaymentMethod,
  selectExistentPaymentMethod,
  tryAnotherPaymentMethod,
} from 'pages/__tests__/helpers/payment'
import { confirmAddPaymentMethod, rejectAddPaymentMethod } from 'pages/helpers'
import { Cookie } from 'services/cookie'
import { knownFeatureFlags } from 'services/feature-flags'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const CHECKOUT_TPV_OK_URL = new URLSearchParams({
  status: 'success',
  payment_method: 'bizum',
  payment_flow: 'checkout',
  payment_authentication_uuid: 'checkout_authentication_uuid',
})
const CHECKOUT_TPV_KO_URL = new URLSearchParams({
  status: 'failure',
  payment_method: 'bizum',
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
          path: '/customers/1/payment-cards/?lang=en&wh=vlc1',
          responseBody: {
            results: [
              PaymentMethodMother.creditCardVisaValid(),
              PaymentMethodMother.bizum(),
            ],
          },
          catchParams: true,
        },
        {
          path: '/customers/1/checkouts/5/payment-method/',
          method: 'put',
          requestBody: { payment_method: { id: 4722 } },
        },
        {
          path: '/customers/1/checkouts/5/orders/',
          method: 'post',
          responseBody: CheckoutMother.confirmed(),
        },
        {
          path: '/customers/1/orders/44051/',
          method: 'get',
          responseBody: OrderMother.confirmedWithBizum(),
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
          path: '/customers/1/checkouts/5/orders/',
          method: 'post',
          status: 400,
          responseBody: {
            errors: [
              PaymentAuthenticationRequiredException.toJSON({
                authentication_uuid: 'checkout_authentication_uuid',
              }),
            ],
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

      it('should redirect to TPV on authentication_required exception', async () => {
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
                    authentication_uuid: 'checkout_authentication_uuid',
                  }),
                ],
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
                      payment_method: 'bizum',
                      payment_flow: 'update_checkout_payment_method',
                      payment_authentication_uuid:
                        'checkout_authentication_uuid',
                    },
                  )}`,
                  ko_url: `http://localhost:3000/checkout/5?${new URLSearchParams(
                    {
                      status: 'failure',
                      payment_method: 'bizum',
                      payment_flow: 'update_checkout_payment_method',
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
                path: '/customers/1/checkouts/5/orders/',
                method: 'post',
                responseBody: CheckoutMother.confirmed(),
              },
              {
                path: `/customers/1/orders/44051/`,
                responseBody: OrderMother.confirmedWithBizum(),
              },
            ])
            .withLogin()
            .mount()

          await waitFor(() => {
            expect('/customers/1/checkouts/5/orders/').toHaveBeenFetched()
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
                path: '/customers/1/checkouts/5/orders/',
                method: 'post',
                status: 200,
                responseBody: CheckoutMother.confirmed(),
              },
            ])
            .withLogin()
            .mount()

          await waitFor(() => {
            expect('/customers/1/checkouts/5/orders/').toHaveBeenFetched()
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
            path: '/customers/1/checkouts/5/orders/',
            method: 'POST',
            responseBody: CheckoutMother.confirmed(),
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
        name: 'We’re sorry, we couldn’t complete the order',
      })

      expect(paymentFailedDialog).toBeInTheDocument()
      expect(paymentFailedDialog).toHaveTextContent(
        'It looks like there was a problem with the bank authorisation. You can try with another card or find more information in the Help section.',
      )

      closeSCAWithoutSaving()

      expect(
        screen.getByRole('button', { name: 'Confirm order' }),
      ).toBeInTheDocument()

      expect(paymentFailedDialog).not.toBeInTheDocument()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'failed_authentication_alert_close_click',
        {
          flow: 'checkout',
        },
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
        name: 'We’re sorry, we couldn’t complete the order',
      })

      expect(paymentFailedDialog).toBeInTheDocument()
      expect(paymentFailedDialog).toHaveTextContent(
        'It looks like there was a problem with the bank authorisation. You can try with another card or find more information in the Help section.',
      )

      tryAnotherPaymentMethod()

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
            path: '/customers/1/checkouts/5/orders/',
            method: 'POST',
            responseBody: CheckoutMother.confirmed(),
          },
        ])
        .withLogin()
        .mount()

      const paymentFailedDialog = await screen.findByRole('dialog', {
        name: 'We’re sorry, we couldn’t complete the order',
      })

      expect(paymentFailedDialog).toBeInTheDocument()
      expect(paymentFailedDialog).toHaveTextContent(
        'It looks like there was a problem with the bank authorisation. You can try with another card or find more information in the Help section.',
      )

      tryAnotherPaymentMethod()

      await selectExistentPaymentMethod('Visa, **** 6017, Expires 01/23')
      savePaymentMethod()
      await confirmCheckout()

      await screen.findByRole(
        'region',
        {
          name: 'Order 44051 confirmed',
        },
        { timeout: 5000 },
      )
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
})
