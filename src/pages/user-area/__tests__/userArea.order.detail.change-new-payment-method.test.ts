import { act, cleanup, screen, waitFor, within } from '@testing-library/react'

import { authorizeMIT } from './helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import {
  PaymentAuthenticationRequiredException,
  PaymentTPV,
  PhoneWithoutBizumException,
} from 'app/payment'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import { paymentAuthenticationRequired } from 'app/payment/__scenarios__/payments'
import {
  clickToAddNewPaymentMethod,
  clickToModifyPaymentMethod,
  selectNewPaymentMethodBizum,
  selectNewPaymentMethodCard,
} from 'pages/__tests__/helper'
import { confirmAddPaymentMethod, rejectAddPaymentMethod } from 'pages/helpers'
import { changePaymentScaChallengeSuccess } from 'pages/order-products/__tests__/helpers'
import { Cookie } from 'services/cookie'
import { knownFeatureFlags } from 'services/feature-flags'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const fillBizumForm = async (phoneNumber = '600123456', submit = true) => {
  const dialogAddPaymentMethod = await screen.findByRole('dialog', {
    name: 'Add payment method',
  })

  const bizumPhoneNumber = await within(dialogAddPaymentMethod).findByRole(
    'textbox',
    {
      name: 'Number',
    },
  )
  const submitButton = within(dialogAddPaymentMethod).getByRole('button', {
    name: 'Continue',
  })

  userEvent.type(bizumPhoneNumber, phoneNumber)

  if (submit) {
    userEvent.click(submitButton)
  }
}

describe('User Area - Order Detail - Change New Payment Method', () => {
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
    Storage.clear()
    localStorage.clear()
    cleanup()
  })

  it('should display new payment method sticky dialog', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
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
              PaymentMethodMother.creditCardMastercardValid(),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    await clickToModifyPaymentMethod()
    await clickToAddNewPaymentMethod()

    const dialogAddPaymentMethod = await screen.findByRole('dialog', {
      name: 'Add payment method',
    })

    expect(dialogAddPaymentMethod).toBeInTheDocument()
    expect(dialogAddPaymentMethod).toHaveTextContent('Select a payment method')
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
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.confirmed(),
        },
        {
          path: '/customers/1/orders/44051/lines/prepared/',
          responseBody: preparedLines,
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

    await screen.findByText('Order 44051')

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
        .atPath('/user-area/orders/44051')
        .withNetwork([
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
              results: [PaymentMethodMother.creditCardMastercardValid()],
            },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      await clickToModifyPaymentMethod()
      await clickToAddNewPaymentMethod()
      await selectNewPaymentMethodBizum()

      const dialogAddPaymentMethod = screen.getByRole('dialog', {
        name: 'Add payment method',
      })

      const bizumPhoneNumber = await within(dialogAddPaymentMethod).findByRole(
        'textbox',
        {
          name: 'Number',
        },
      )

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
        within(dialogAddPaymentMethod).getByRole('button', { name: 'Go back' }),
      ).toBeInTheDocument()
      expect(
        within(dialogAddPaymentMethod).getByRole('button', {
          name: 'Continue',
        }),
      ).toBeInTheDocument()
    })

    it('should show error message for invalid bizum number', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
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
              results: [PaymentMethodMother.creditCardMastercardValid()],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-method-bizum/',
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

      await screen.findByText('Order 44051')

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
        .atPath('/user-area/orders/44051')
        .withNetwork([
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
              results: [PaymentMethodMother.creditCardMastercardValid()],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-method-bizum/',
            method: 'POST',
            requestBody: {
              phone_country_code: '34',
              phone_national_number: '600123456',
            },
            status: 400,
            responseBody: {
              errors: [
                PaymentAuthenticationRequiredException.toJSON({
                  authentication_uuid: 'payment_authentication_uuid',
                }),
              ],
            },
          },
          {
            path: `/customers/1/orders/44051/authentication/?${new URLSearchParams(
              {
                lang: 'en',
                wh: 'vlc1',
                authentication_uuid: 'payment_authentication_uuid',
                ok_url: `http://localhost:3000/user-area/orders/44051?${new URLSearchParams(
                  {
                    status: 'success',
                    payment_method: 'bizum',
                    payment_flow: 'update_order_payment_method',
                    payment_authentication_uuid: 'payment_authentication_uuid',
                  },
                )}`,
                ko_url: `http://localhost:3000/user-area/orders/44051?${new URLSearchParams(
                  {
                    status: 'failure',
                    payment_method: 'bizum',
                    payment_flow: 'update_order_payment_method',
                    payment_authentication_uuid: 'payment_authentication_uuid',
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

      await screen.findByText('Order 44051')

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
      it('should show an error message on ko and close it without unified authentication error modal', async () => {
        wrap(App)
          .atPath(
            '/user-area/orders/44051?status=failure&payment_method=bizum&payment_authentication_uuid=payment_authentication_uuid&payment_flow=update_order_payment_method',
          )
          .withNetwork([
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
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        const paymentFailedDialog = await screen.findByRole('dialog')

        const closeButton = within(paymentFailedDialog).getByRole('button', {
          name: 'Close without saving changes',
        })

        userEvent.click(closeButton)

        await waitFor(() => {
          expect(paymentFailedDialog).not.toBeInTheDocument()
        })
      })

      it('should show an error message on ko and retry without unified authentication error modal', async () => {
        wrap(App)
          .atPath(
            '/user-area/orders/44051?status=failure&payment_method=bizum&payment_authentication_uuid=payment_authentication_uuid&payment_flow=update_order_payment_method',
          )
          .withNetwork([
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
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        const paymentFailedDialog = await screen.findByRole('dialog')

        const retryButton = within(paymentFailedDialog).getByRole('button', {
          name: 'Try again',
        })

        userEvent.click(retryButton)

        await waitFor(() => {
          expect(paymentFailedDialog).not.toBeInTheDocument()
        })
      })

      it('should show an error message on ko and close it', async () => {
        activeFeatureFlags([
          knownFeatureFlags.UNIFY_PAYMENT_AUTHENTICATION_ERROR,
        ])

        wrap(App)
          .atPath(
            '/user-area/orders/44051?status=failure&payment_method=bizum&payment_authentication_uuid=payment_authentication_uuid&payment_flow=update_order_payment_method',
          )
          .withNetwork([
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
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

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
          expect(paymentFailedDialog).not.toBeInTheDocument()
        })
      })

      it('should show an error message on ko and retry', async () => {
        activeFeatureFlags([
          knownFeatureFlags.UNIFY_PAYMENT_AUTHENTICATION_ERROR,
        ])

        wrap(App)
          .atPath(
            '/user-area/orders/44051?status=failure&payment_method=bizum&payment_authentication_uuid=payment_authentication_uuid&payment_flow=update_order_payment_method',
          )
          .withNetwork([
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
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        const paymentFailedDialog = await screen.findByRole('dialog', {
          name: 'The transaction could not be carried out',
        })

        const retryButton = within(paymentFailedDialog).getByRole('button', {
          name: 'Retry',
        })

        userEvent.click(retryButton)

        await waitFor(() => {
          expect(paymentFailedDialog).not.toBeInTheDocument()
        })
      })

      it('should show success modal after retrying payment with bizum as payment method success', async () => {
        vi.useFakeTimers()

        wrap(App)
          .atPath(
            '/user-area/orders/44051?status=success&payment_method=bizum&payment_authentication_uuid=payment_authentication_uuid&payment_flow=update_order_payment_method',
          )
          .withNetwork([
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
                results: [PaymentMethodMother.creditCardMastercardValid()],
              },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        const successModal = await screen.findByRole('dialog', {
          name: 'Payment method updated',
        })

        expect(successModal).toBeInTheDocument()

        vi.advanceTimersByTime(2999)
        expect(successModal).toBeInTheDocument()

        vi.advanceTimersByTime(1)
        expect(successModal).not.toBeInTheDocument()

        vi.useRealTimers()
      })

      it('should refetch the order with bizum on success', async () => {
        wrap(App)
          .atPath(
            '/user-area/orders/44051?status=success&payment_method=bizum&payment_authentication_uuid=payment_authentication_uuid&payment_flow=update_order_payment_method',
          )
          .withNetwork([
            {
              path: '/customers/1/orders/44051/',
              multipleResponses: [
                {
                  responseBody: OrderMother.confirmed(),
                },
                {
                  responseBody: OrderMother.confirmed(),
                },
                {
                  responseBody: OrderMother.confirmedWithBizum(),
                },
                {
                  responseBody: OrderMother.confirmedWithBizum(),
                },
              ],
            },
            {
              path: '/customers/1/orders/44051/lines/prepared/',
              responseBody: preparedLines,
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

        await screen.findByText('Order 44051')

        const paymentSection = screen.getByRole('region', {
          name: 'Payment method',
        })

        await waitFor(() => {
          expect(within(paymentSection).getByText('Bizum')).toBeInTheDocument()
        })
      })
    })
  })

  describe('Change New Payment Method Card', () => {
    it('should display new payment method card form', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
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

      await screen.findByText('Order 44051')

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
      expect(annotationPaymentMethodsCards).toHaveTextContent('Accepted cards')
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
          .atPath('/user-area/orders/44051')
          .withNetwork([
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

        await screen.findByText('Order 44051')

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
          .atPath('/user-area/orders/44051')
          .withNetwork([
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

        await screen.findByText('Order 44051')

        await clickToModifyPaymentMethod()
        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodCard()

        const redsysIframe = await screen.findByTitle('payment-card-tpv-iframe')
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

      describe('Payment authentication required', () => {
        it('should update the payment method on success with status 419 MIT', async () => {
          vi.useFakeTimers()

          wrap(App)
            .atPath('/user-area/orders/44051')
            .withNetwork([
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
                  results: [PaymentMethodMother.creditCardMastercardValid()],
                },
              },
              {
                path: '/customers/1/payment-cards/new/',
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
                path: '/customers/1/payment-cards/auth/sca_id/?lang=en&wh=vlc1&ok_url=http://localhost:3000/sca_update_payment_ok.html?url=http://localhost:3000/user-area/orders/44051&ko_url=http://localhost:3000/sca_update_payment_ko.html?url=http://localhost:3000/user-area/orders/44051&checkout_auto_confirm=yes',
                catchParams: true,
                responseBody: PaymentAuthenticationMother.redsysCard(),
              },
            ])
            .withLogin()
            .mount()

          await screen.findByText('Order 44051')

          await clickToModifyPaymentMethod()
          await clickToAddNewPaymentMethod()
          await selectNewPaymentMethodCard()

          await screen.findByTitle('payment-card-tpv-iframe')
          confirmAddPaymentMethod()

          await screen.findByRole('dialog', {
            name: 'Authorisation required',
          })

          authorizeMIT()
          await screen.findByTestId('sca-form')
          changePaymentScaChallengeSuccess(() => {
            wrap(App)
              .atPath('/user-area/orders/44051')
              .withNetwork([
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
                  method: 'put',
                  path: '/customers/1/orders/44051/payment-method/',
                  requestBody: { payment_method: { id: 4720 } },
                  responseBody: {
                    ...OrderMother.confirmedWithMastercard(),
                    payment_method: {
                      ...PaymentMethodMother.creditCardMastercardValid(),
                      ui_content: undefined,
                    },
                  },
                },
              ])
              .withLogin()
              .mount()
          })

          const paymentSection = await screen.findByRole('region', {
            name: 'Payment method',
          })

          await waitFor(() => {
            expect(
              within(paymentSection).getByText('**** 6023'),
            ).toBeInTheDocument()
          })
        })

        it('should update the payment method on success with status 418', async () => {
          vi.useFakeTimers()

          wrap(App)
            .atPath('/user-area/orders/44051')
            .withNetwork([
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
                  results: [PaymentMethodMother.creditCardMastercardValid()],
                },
              },
              {
                path: '/customers/1/payment-cards/new/',
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
                path: '/customers/1/payment-cards/auth/sca_id/?lang=en&wh=vlc1&ok_url=http://localhost:3000/sca_update_payment_ok.html?url=http://localhost:3000/user-area/orders/44051&ko_url=http://localhost:3000/sca_update_payment_ko.html?url=http://localhost:3000/user-area/orders/44051&checkout_auto_confirm=yes',
                catchParams: true,
                responseBody: PaymentAuthenticationMother.redsysCard(),
              },
            ])
            .withLogin()
            .mount()

          await screen.findByText('Order 44051')

          await clickToModifyPaymentMethod()
          await clickToAddNewPaymentMethod()
          await selectNewPaymentMethodCard()

          await screen.findByTitle('payment-card-tpv-iframe')
          confirmAddPaymentMethod()

          await screen.findByTestId('sca-form')
          changePaymentScaChallengeSuccess(() => {
            wrap(App)
              .atPath('/user-area/orders/44051')
              .withNetwork([
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
                  method: 'put',
                  path: '/customers/1/orders/44051/payment-method/',
                  requestBody: { payment_method: { id: 4720 } },
                  responseBody: {
                    ...OrderMother.confirmedWithMastercard(),
                    payment_method: {
                      ...PaymentMethodMother.creditCardMastercardValid(),
                      ui_content: undefined,
                    },
                  },
                },
              ])
              .withLogin()
              .mount()
          })

          const paymentSection = await screen.findByRole('region', {
            name: 'Payment method',
          })

          await waitFor(() => {
            expect(
              within(paymentSection).getByText('**** 6023'),
            ).toBeInTheDocument()
          })
        })
      })
    })
  })
})
