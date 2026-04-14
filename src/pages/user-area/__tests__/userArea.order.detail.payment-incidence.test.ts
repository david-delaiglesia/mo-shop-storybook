import {
  cleanup,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { HomeSectionMother } from 'app/home/__scenarios__/HomeSectionMother'
import { HomeSectionsBuilder } from 'app/home/__scenarios__/HomeSectionsBuilder'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { preparedLines } from 'app/order/__scenarios__/orderDetail'
import {
  PaymentAuthenticationRequiredException,
  PaymentIncidentReason,
  PaymentIncidentState,
  PaymentIncidentStatus,
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
  clickToCancelPaymentAuthenticating,
  clickToGoBack,
  clickToModifyPaymentMethodResolvePaymentIncident,
  clickToResolveOrderPaymentIssue,
  clickToResolvePaymentIncidentWidget,
  clickToRetryPayment,
  findPaymentMethodSection,
  selectExistentPaymentMethod,
} from 'pages/__tests__/helpers/payment'
import {
  closeModal,
  confirmAddPaymentMethod,
  rejectAddPaymentMethod,
} from 'pages/helpers'
import { Cookie } from 'services/cookie'
import { knownFeatureFlags } from 'services/feature-flags'
import { Storage } from 'services/storage'
import { STORAGE_KEYS } from 'services/storage/constants'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const TPV_OK_URL = `/user-area/orders/44051?${new URLSearchParams({
  status: 'success',
  payment_method: 'any',
  payment_flow: 'resolve_payment_incidence',
  payment_authentication_uuid: 'auth-uuid',
})}`

const TPV_KO_URL = `/user-area/orders/44051?${new URLSearchParams({
  status: 'failure',
  payment_method: 'any',
  payment_flow: 'resolve_payment_incidence',
  payment_authentication_uuid: 'auth-uuid',
})}`

describe('User Area - Order Detail - PaymentIncidence', () => {
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
    vi.useRealTimers()
    Storage.clear()
    localStorage.clear()
    cleanup()
  })

  it('should display payment error banner', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          responseBody: OrderMother.paymentFailed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    const paymentSection = await findPaymentMethodSection()

    const incidenceBanner = within(paymentSection).getByRole('mark')
    const updateButton = within(paymentSection).getByRole('button', {
      name: 'Modify',
    })

    expect(incidenceBanner).toHaveTextContent(
      'Edit the payment method to solve the payment issue',
    )
    expect(updateButton).toBeInTheDocument()
  })

  it('should open sticky modal on click to modify payment method', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          responseBody: OrderMother.paymentFailed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [
              PaymentMethodMother.creditCardVisaValid(),
              PaymentMethodMother.creditCardMastercardValid(),
              PaymentMethodMother.bizum(),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    await clickToModifyPaymentMethod()

    const resolveModal = await screen.findByRole('dialog', {
      name: 'Solve incident',
    })

    expect(resolveModal).toBeInTheDocument()
  })

  it.each([
    {
      reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
      expectedText: 'Please check your account balance or spending limit.',
    },
    {
      reason: PaymentIncidentReason.INACTIVE_CARD,
      expectedText: 'Please check that your card is active.',
    },
    {
      reason: PaymentIncidentReason.UNKNOWN,
      expectedText:
        'The payment for your order was not completed successfully.',
    },
    {
      reason: PaymentIncidentReason.ONLINE_PAYMENT_DISABLED,
      expectedText:
        'Make sure online purchases are enabled for this payment method.',
    },
    {
      reason: null,
      expectedText:
        'The payment for your order was not completed successfully.',
    },
    {
      reason: 'unexistent_reason',
      expectedText:
        'The payment for your order was not completed successfully.',
    },
  ])(
    'should open sticky modal on click to resolve payment incident in status with reason $reason',
    async ({ reason, expectedText }) => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            responseBody: OrderMother.paymentFailed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.creditCardMastercardValid(),
                PaymentMethodMother.bizum(),
              ],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason,
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()

      const resolveModal = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      expect(resolveModal).toBeInTheDocument()

      const errorDetailSection = within(resolveModal).getByRole('region', {
        name: 'Payment declined by your bank',
      })

      expect(errorDetailSection).toHaveTextContent(expectedText)

      expect(errorDetailSection).toHaveTextContent(
        'Check your payment method or select another one before retrying.',
      )

      const paymentMethodSection = within(resolveModal).getByRole('region', {
        name: 'Payment method',
      })

      const modifyButton = within(paymentMethodSection).getByRole('button', {
        name: 'Modify',
      })

      expect(modifyButton).toBeInTheDocument()

      expect(paymentMethodSection).toHaveTextContent('**** 6017')

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'solve_payment_issue_view',
        {
          order_id: 44051,
          error_description_displayed: expectedText,
          error_type: reason,
        },
      )
    },
  )

  it('should open sticky modal on click to resolve payment incident in home widget', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        {
          path: '/customers/1/home/',
          responseBody: new HomeSectionsBuilder()
            .withSection(
              HomeSectionMother.widgetOrders([OrderMother.paymentFailed()]),
            )
            .build(),
        },
        {
          path: `/customers/1/orders/44051/`,
          responseBody: OrderMother.paymentFailed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [
              PaymentMethodMother.creditCardVisaValid(),
              PaymentMethodMother.creditCardMastercardValid(),
              PaymentMethodMother.bizum(),
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Próxima entrega')

    clickToResolvePaymentIncidentWidget()

    await screen.findByText('Order 44051')

    const resolveModal = await screen.findByRole('dialog', {
      name: 'Solve incident',
    })

    expect(resolveModal).toBeInTheDocument()
  })

  it('should send metric on close the resolve modal', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          responseBody: OrderMother.paymentFailed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [
              PaymentMethodMother.creditCardVisaValid(),
              PaymentMethodMother.creditCardMastercardValid(),
              PaymentMethodMother.bizum(),
            ],
          },
        },
        {
          path: '/customers/1/orders/44051/payment-incident/',
          responseBody: {
            reason: PaymentIncidentReason.UNKNOWN,
            payment_method: PaymentMethodMother.creditCardVisaValid(),
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    clickToResolveOrderPaymentIssue()

    const resolveModal = await screen.findByRole('dialog', {
      name: 'Solve incident',
    })

    closeModal()

    await waitFor(() => {
      expect(resolveModal).not.toBeInTheDocument()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'payment_method_modal_close',
      )
    })
  })

  it('should check for payment status on enter', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          responseBody: OrderMother.paymentFailed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/orders/44051/payment-incident/status/',
          method: 'GET',
          responseBody: {
            reason: PaymentIncidentReason.UNKNOWN,
            status: PaymentIncidentStatus.FAILED,
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    expect(
      '/customers/1/orders/44051/payment-incident/status/',
    ).toHaveBeenFetchedTimes(1)
  })

  it('should reactivate polling for payment status pending', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          responseBody: OrderMother.paymentFailed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/orders/44051/payment-incident/status/',
          method: 'GET',
          multipleResponses: [
            {
              responseBody: {
                status: PaymentIncidentStatus.PENDING,
              },
            },
            {
              responseBody: {
                status: PaymentIncidentStatus.PENDING,
              },
            },
            {
              responseBody: {
                status: PaymentIncidentStatus.PENDING,
              },
            },
            {
              responseBody: {
                status: PaymentIncidentStatus.SUCCEEDED,
              },
            },
          ],
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    const pageLoader = await screen.findByLabelText('Connecting with your bank')

    await waitForElementToBeRemoved(pageLoader, { timeout: 5000 })
    expect(
      '/customers/1/orders/44051/payment-incident/status/',
    ).toHaveBeenFetchedTimes(4) // 1 on load + 3 on polling (3 pending, 1 succeeded to stop polling)
  })

  it('should redirect to webview when initial check returns fallback_required', async () => {
    activeFeatureFlags([knownFeatureFlags.BIZUM_REST_RESOLVE_PAYMENT_INCIDENT])
    vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

    wrap(App)
      .debugRequests()
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          responseBody: OrderMother.paymentFailed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [PaymentMethodMother.creditCardVisaValid()],
          },
        },
        {
          path: '/customers/1/orders/44051/payment-incident/status/',
          responseBody: {
            state: PaymentIncidentState.FALLBACK_REQUIRED,
            authentication_uuid: 'auth-uuid',
          },
        },
        {
          path: `/customers/1/orders/44051/authentication/?${new URLSearchParams(
            {
              lang: 'en',
              wh: 'vlc1',
              authentication_uuid: 'auth-uuid',
              ok_url: `http://localhost:3000/user-area/orders/44051?${new URLSearchParams(
                {
                  status: 'success',
                  payment_method: 'any',
                  payment_flow: 'resolve_payment_incidence',
                  payment_authentication_uuid: 'auth-uuid',
                },
              )}`,
              ko_url: `http://localhost:3000/user-area/orders/44051?${new URLSearchParams(
                {
                  status: 'failure',
                  payment_method: 'any',
                  payment_flow: 'resolve_payment_incidence',
                  payment_authentication_uuid: 'auth-uuid',
                },
              )}`,
            },
          )}`,
          catchParams: true,
          responseBody: PaymentAuthenticationMother.redsysCard(),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    await await screen.findByRole('dialog', {
      name: 'Connecting with your bank',
    })

    await waitFor(() => {
      expect(PaymentTPV.autoRedirectToPaymentAuth).toHaveBeenCalledWith(
        PaymentAuthenticationMother.redsysCard().params,
      )
    })
  })

  it('should retry payment when clicking in retry payment button from payment methods list', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          multipleResponses: [
            {
              responseBody: {
                ...OrderMother.paymentFailed(),
                payment_method: PaymentMethodMother.bizum(),
              },
            },
            {
              responseBody: {
                ...OrderMother.preparedPaid(),
                payment_method: PaymentMethodMother.bizum(),
              },
            },
          ],
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [
              PaymentMethodMother.creditCardVisaValid(),
              PaymentMethodMother.creditCardMastercardValid(),
              PaymentMethodMother.bizum(),
            ],
          },
        },
        {
          path: '/customers/1/orders/44051/payment-incident/',
          responseBody: {
            reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
            payment_method: PaymentMethodMother.creditCardVisaValid(),
          },
        },
        {
          path: '/customers/1/orders/44051/payment-incident/resolve/',
          method: 'POST',
          requestBody: {
            payment_method_id: PaymentMethodMother.bizum().id,
          },
        },
        {
          path: '/customers/1/orders/44051/payment-incident/status/',
          multipleResponses: [
            {
              responseBody: {
                reason: PaymentIncidentReason.UNKNOWN,
                status: PaymentIncidentStatus.FAILED,
              },
            },
            {
              responseBody: {
                status: PaymentIncidentStatus.PENDING,
              },
            },
            {
              responseBody: {
                status: PaymentIncidentStatus.SUCCEEDED,
              },
            },
          ],
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    clickToResolveOrderPaymentIssue()

    const resolveModal = await screen.findByRole('dialog', {
      name: 'Solve incident',
    })

    expect(resolveModal).toBeInTheDocument()

    await clickToModifyPaymentMethodResolvePaymentIncident()

    const currentPaymentMethodsModal = await screen.findByRole('dialog', {
      name: 'Payment method',
    })
    expect(currentPaymentMethodsModal).toBeInTheDocument()

    expect(currentPaymentMethodsModal).toHaveTextContent(
      'Saved payment methods',
    )

    expect(
      within(currentPaymentMethodsModal).getAllByRole('radio'),
    ).toHaveLength(3)

    const addPaymentMethodButton = await within(
      currentPaymentMethodsModal,
    ).findByRole('button', {
      name: 'Add payment method',
    })
    expect(addPaymentMethodButton).toBeInTheDocument()

    clickToRetryPayment()

    expect(currentPaymentMethodsModal).not.toBeInTheDocument()
    expect(
      '/customers/1/orders/44051/payment-incident/resolve/',
    ).toHaveBeenFetched()

    const orderStatus = await screen.findByRole('status', {
      name: 'Prepared',
    })
    expect(orderStatus).toHaveTextContent(
      'Your order is now prepared and charged.',
    )

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'payment_methods_modal_view',
      {
        payment_method_ids: [
          PaymentMethodMother.creditCardVisaValid().id,
          PaymentMethodMother.creditCardMastercardValid().id,
          PaymentMethodMother.bizum().id,
        ],
      },
    )

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'solve_payment_issue_click',
      {
        order_id: 44051,
        status: 'payment-issue',
      },
    )
  })

  it('should display solve incident modal content when clicking in go back button', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          responseBody: OrderMother.paymentFailed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [
              PaymentMethodMother.creditCardVisaValid(),
              PaymentMethodMother.creditCardMastercardValid(),
              PaymentMethodMother.bizum(),
            ],
          },
        },
        {
          path: '/customers/1/orders/44051/payment-incident/',
          responseBody: {
            reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
            payment_method: PaymentMethodMother.creditCardVisaValid(),
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    clickToResolveOrderPaymentIssue()

    const resolveModal = await screen.findByRole('dialog', {
      name: 'Solve incident',
    })
    expect(resolveModal).toBeInTheDocument()

    await clickToModifyPaymentMethodResolvePaymentIncident()

    await clickToGoBack()

    const goBackResolveModal = await screen.findByRole('dialog', {
      name: 'Solve incident',
    })
    expect(goBackResolveModal).toBeInTheDocument()
  })

  it('should not display payment incident reason in modal when payment fails with unknown reason', async () => {
    wrap(App)
      .atPath('/user-area/orders/44051')
      .withNetwork([
        {
          path: `/customers/1/orders/44051/`,
          responseBody: OrderMother.paymentFailed(),
        },
        {
          path: `/customers/1/orders/44051/lines/prepared/`,
          responseBody: preparedLines,
        },
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [
              PaymentMethodMother.creditCardVisaValid(),
              PaymentMethodMother.creditCardMastercardValid(),
              PaymentMethodMother.bizum(),
            ],
          },
        },
        {
          path: '/customers/1/orders/44051/payment-incident/',
          responseBody: {
            reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
            payment_method: PaymentMethodMother.creditCardVisaValid(),
          },
        },
        {
          path: '/customers/1/orders/44051/payment-incident/resolve/',
          method: 'POST',
          requestBody: {
            payment_method_id: PaymentMethodMother.bizum().id,
          },
        },
        {
          path: '/customers/1/orders/44051/payment-incident/status/',
          multipleResponses: [
            {
              responseBody: {
                reason: PaymentIncidentReason.UNKNOWN,
                status: PaymentIncidentStatus.FAILED,
              },
            },
            {
              responseBody: {
                status: PaymentIncidentStatus.PENDING,
              },
            },
            {
              responseBody: {
                reason: PaymentIncidentReason.UNKNOWN,
                status: PaymentIncidentStatus.FAILED,
              },
            },
          ],
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Order 44051')

    clickToResolveOrderPaymentIssue()

    const resolveModal = await screen.findByRole('dialog', {
      name: 'Solve incident',
    })

    clickToRetryPayment()

    expect(resolveModal).not.toBeInTheDocument()
    expect(
      '/customers/1/orders/44051/payment-incident/resolve/',
    ).toHaveBeenFetched()

    const paymentFailedModal = await screen.findByRole('dialog', {
      name: 'The transaction could not be carried out',
    })
    expect(paymentFailedModal).toBeInTheDocument()

    const paymentIncidentReason =
      within(paymentFailedModal).queryByRole('status')

    expect(paymentIncidentReason).not.toBeInTheDocument()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('payment_error_view', {
      order_id: 44051,
      error_header_displayed: 'The transaction could not be carried out',
      error_type: 'unknown',
    })
  })

  it.each([
    {
      reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
      expectedText: 'Please check your account balance or spending limit.',
    },
    {
      reason: PaymentIncidentReason.INACTIVE_CARD,
      expectedText: 'Please check that your card is active.',
    },
    {
      reason: PaymentIncidentReason.ONLINE_PAYMENT_DISABLED,
      expectedText:
        'Make sure online purchases are enabled for this payment method.',
    },
  ])(
    'should display payment incident reason in modal when payment fails with $reason reason',
    async ({ reason, expectedText }) => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            responseBody: OrderMother.paymentFailed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.creditCardMastercardValid(),
                PaymentMethodMother.bizum(),
              ],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/resolve/',
            method: 'POST',
            requestBody: {
              payment_method_id: PaymentMethodMother.bizum().id,
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/status/',
            multipleResponses: [
              {
                responseBody: {
                  reason: PaymentIncidentReason.UNKNOWN,
                  status: PaymentIncidentStatus.FAILED,
                },
              },
              {
                responseBody: {
                  status: PaymentIncidentStatus.PENDING,
                },
              },
              {
                responseBody: {
                  reason,
                  status: PaymentIncidentStatus.FAILED,
                },
              },
            ],
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()

      const resolveModal = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      expect(resolveModal).toBeInTheDocument()

      clickToRetryPayment()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'payment_retry_click',
        {
          order_id: 44051,
        },
      )
      expect(resolveModal).not.toBeInTheDocument()
      expect(
        '/customers/1/orders/44051/payment-incident/resolve/',
      ).toHaveBeenFetched()

      const paymentFailedModal = await screen.findByRole('dialog', {
        name: 'The transaction could not be carried out',
      })

      const paymentIncidentReason =
        within(paymentFailedModal).getByRole('status')

      expect(paymentIncidentReason).toHaveTextContent(expectedText)

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'payment_error_view',
        {
          order_id: 44051,
          error_header_displayed: expectedText,
          error_type: reason,
        },
      )
    },
  )

  describe('Bizum payment method', () => {
    it('should retry payment with the current bizum', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            multipleResponses: [
              {
                responseBody: {
                  ...OrderMother.paymentFailed(),
                  payment_method: PaymentMethodMother.bizum(),
                },
              },
              {
                responseBody: {
                  ...OrderMother.preparedPaid(),
                  payment_method: PaymentMethodMother.bizum(),
                },
              },
            ],
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
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
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.bizum(),
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/resolve/',
            method: 'POST',
            requestBody: {
              payment_method_id: PaymentMethodMother.bizum().id,
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/status/',
            multipleResponses: [
              {
                responseBody: {
                  reason: PaymentIncidentReason.UNKNOWN,
                  status: PaymentIncidentStatus.FAILED,
                },
              },
              {
                responseBody: {
                  status: PaymentIncidentStatus.PENDING,
                },
              },
              {
                responseBody: {
                  status: PaymentIncidentStatus.SUCCEEDED,
                },
              },
            ],
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()
      const resolveIncidenceModal = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      clickToRetryPayment()

      expect(resolveIncidenceModal).not.toBeInTheDocument()
      expect(
        '/customers/1/orders/44051/payment-incident/resolve/',
      ).toHaveBeenFetched()

      const orderStatus = await screen.findByRole('status', {
        name: 'Prepared',
      })
      expect(orderStatus).toHaveTextContent(
        'Your order is now prepared and charged.',
      )

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'change_payment_method_finished',
        {
          payment_digits: '+34 700000000',
          payment_id: PaymentMethodMother.bizum().id,
        },
      )

      await waitFor(() => {
        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'payment_success_view',
          {
            order_id: 44051,
          },
        )
      })
    })

    it('should retry payment with the current bizum and fail', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            responseBody: OrderMother.paymentFailed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [
                PaymentMethodMother.creditCardVisaValid(),
                PaymentMethodMother.creditCardMastercardValid(),
                PaymentMethodMother.bizum(),
              ],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.bizum(),
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/resolve/',
            method: 'POST',
            requestBody: {
              payment_method_id: PaymentMethodMother.bizum().id,
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/status/',
            multipleResponses: [
              {
                responseBody: {
                  reason: PaymentIncidentReason.UNKNOWN,
                  status: PaymentIncidentStatus.FAILED,
                },
              },
              {
                responseBody: {
                  status: PaymentIncidentStatus.PENDING,
                },
              },
              {
                responseBody: {
                  reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
                  status: PaymentIncidentStatus.FAILED,
                },
              },
            ],
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()

      const resolveModal = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      expect(resolveModal).toBeInTheDocument()

      clickToRetryPayment()

      expect(
        '/customers/1/orders/44051/payment-incident/resolve/',
      ).toHaveBeenFetched()

      const paymentFailedModal = await screen.findByRole('dialog', {
        name: 'The transaction could not be carried out',
      })

      expect(paymentFailedModal).toBeInTheDocument()
    })

    it('should retry payment with different existent bizum', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            multipleResponses: [
              {
                responseBody: {
                  ...OrderMother.paymentFailed(),
                  payment_method: PaymentMethodMother.creditCardVisaValid(),
                },
              },
              {
                responseBody: {
                  ...OrderMother.preparedPaid(),
                  payment_method: PaymentMethodMother.creditCardVisaValid(),
                },
              },
            ],
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
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
            path: '/customers/1/orders/44051/payment-incident/resolve/',
            method: 'POST',
            requestBody: {
              payment_method_id: PaymentMethodMother.bizum().id,
            },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()
      const resolveIncidenceModal = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      await clickToModifyPaymentMethodResolvePaymentIncident()
      await selectExistentPaymentMethod('Bizum, +34 700000000, Bizum')
      await clickToRetryPayment()

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'payment_retry_click',
        {
          order_id: 44051,
        },
      )
      expect(resolveIncidenceModal).not.toBeInTheDocument()

      await waitFor(() => {
        expect(
          '/customers/1/orders/44051/payment-incident/resolve/',
        ).toHaveBeenFetched()
      })

      const orderStatus = await screen.findByRole('status', {
        name: 'Prepared',
      })
      expect(orderStatus).toHaveTextContent(
        'Your order is now prepared and charged.',
      )

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'change_payment_method_finished',
        {
          payment_digits: '+34 700000000',
          payment_id: PaymentMethodMother.bizum().id,
        },
      )
    })

    it('should retry payment with different new bizum', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')
      vi.spyOn(window.localStorage.__proto__, 'setItem')

      const OK_URL = `/user-area/orders/44051?${new URLSearchParams({
        status: 'success',
        payment_method: 'any',
        payment_flow: 'resolve_payment_incidence',
        payment_authentication_storage_key:
          '10000000-1000-4000-8000-100000000000',
      })}`
      const KO_URL = `/user-area/orders/44051?${new URLSearchParams({
        status: 'failure',
        payment_method: 'any',
        payment_flow: 'resolve_payment_incidence',
        payment_authentication_storage_key:
          '10000000-1000-4000-8000-100000000000',
      })}`

      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            responseBody: OrderMother.paymentFailed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [PaymentMethodMother.creditCardVisaValid()],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-methods/bizum/',
            method: 'POST',
            requestBody: {
              phone_country_code: '34',
              phone_national_number: '600123456',
              ok_url: `http://localhost:3000${OK_URL}`,
              ko_url: `http://localhost:3000${KO_URL}`,
              flow: 'RESOLVE_PAYMENT_INCIDENT',
            },
            responseBody: PaymentAuthenticationMother.redsysBizum(),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()
      const resolveIncidenceModal = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      await clickToModifyPaymentMethodResolvePaymentIncident()
      await clickToAddNewPaymentMethod()
      await selectNewPaymentMethodBizum()
      await fillBizumForm()

      expect(resolveIncidenceModal).not.toBeInTheDocument()

      await waitFor(() => {
        expect(
          screen.getByLabelText('Connecting with your bank'),
        ).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith(
          '10000000-1000-4000-8000-100000000000',
          'pa_redsys_bizum_uuid',
        )
        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'start_psd2_flow',
          {
            payment_method_type: 'bizum',
            type: 'tokenization_authentication',
            provider: 'redsys',
            payment_authentication_uuid: 'pa_redsys_bizum_uuid',
            user_flow: 'payment_issue',
            is_MIT: false,
          },
        )
        expect(PaymentTPV.autoRedirectToPaymentAuth).toHaveBeenCalledWith(
          PaymentAuthenticationMother.redsysBizum().params,
        )
      })
    })

    it('should retry payment with different new bizum and show phone without bizum exception', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')
      vi.spyOn(window.localStorage.__proto__, 'setItem')

      const OK_URL = `/user-area/orders/44051?${new URLSearchParams({
        status: 'success',
        payment_method: 'any',
        payment_flow: 'resolve_payment_incidence',
        payment_authentication_storage_key:
          '10000000-1000-4000-8000-100000000000',
      })}`
      const KO_URL = `/user-area/orders/44051?${new URLSearchParams({
        status: 'failure',
        payment_method: 'any',
        payment_flow: 'resolve_payment_incidence',
        payment_authentication_storage_key:
          '10000000-1000-4000-8000-100000000000',
      })}`

      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            responseBody: OrderMother.paymentFailed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [PaymentMethodMother.creditCardVisaValid()],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-methods/bizum/',
            method: 'POST',
            requestBody: {
              phone_country_code: '34',
              phone_national_number: '600123456',
              ok_url: `http://localhost:3000${OK_URL}`,
              ko_url: `http://localhost:3000${KO_URL}`,
              flow: 'RESOLVE_PAYMENT_INCIDENT',
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

      clickToResolveOrderPaymentIssue()
      const resolveIncidenceModal = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      await clickToModifyPaymentMethodResolvePaymentIncident()
      await clickToAddNewPaymentMethod()
      await selectNewPaymentMethodBizum()
      await fillBizumForm()

      expect(resolveIncidenceModal).not.toBeInTheDocument()

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

    it('should launch tpv on authentication required on retry payment with bizum', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            responseBody: {
              ...OrderMother.paymentFailed(),
              payment_method: PaymentMethodMother.bizum(),
            },
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.bizum(),
            },
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [PaymentMethodMother.bizum()],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/resolve/',
            method: 'POST',
            status: 400,
            requestBody: {
              payment_method_id: PaymentMethodMother.bizum().id,
            },
            responseBody: {
              errors: [
                PaymentAuthenticationRequiredException.toJSON({
                  authentication_uuid: 'auth-uuid',
                }),
              ],
            },
          },
          {
            path: `/customers/1/orders/44051/authentication/?${new URLSearchParams(
              {
                lang: 'en',
                wh: 'vlc1',
                authentication_uuid: 'auth-uuid',
                ok_url: `http://localhost:3000${TPV_OK_URL}`,
                ko_url: `http://localhost:3000${TPV_KO_URL}`,
              },
            )}`,
            catchParams: true,
            responseBody: PaymentAuthenticationMother.redsysBizum(),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()
      const resolveIncidenceModal = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      await clickToRetryPayment()

      expect(resolveIncidenceModal).not.toBeInTheDocument()

      await waitFor(() => {
        expect(
          screen.getByLabelText('Connecting with your bank'),
        ).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'start_psd2_flow',
          {
            payment_method_type: 'bizum',
            type: 'authentication',
            provider: 'redsys',
            payment_authentication_uuid: 'pa_redsys_bizum_uuid',
            user_flow: 'payment_issue',
            is_MIT: false,
          },
        )
        expect(PaymentTPV.autoRedirectToPaymentAuth).toHaveBeenCalledWith(
          PaymentAuthenticationMother.redsysBizum().params,
        )
      })
    })

    describe('Retry payment with bizum and return new REST strategy under flag', () => {
      beforeEach(() => {
        activeFeatureFlags([
          knownFeatureFlags.BIZUM_REST_RESOLVE_PAYMENT_INCIDENT,
        ])
      })

      it('should retry payment with the current bizum', async () => {
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: `/customers/1/orders/44051/`,
              multipleResponses: [
                {
                  responseBody: {
                    ...OrderMother.paymentFailed(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
                {
                  responseBody: {
                    ...OrderMother.preparedPaid(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
              ],
            },
            {
              path: `/customers/1/orders/44051/lines/prepared/`,
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [
                  PaymentMethodMother.creditCardVisaValid(),
                  PaymentMethodMother.creditCardMastercardValid(),
                  PaymentMethodMother.bizum(),
                ],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/',
              responseBody: {
                reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
                payment_method: PaymentMethodMother.creditCardVisaValid(),
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/resolve/',
              method: 'POST',
              status: 202,
              requestBody: {
                payment_method_id: PaymentMethodMother.bizum().id,
              },
              responseBody: {
                code: 'processing_payment',
                authentication_uuid: null,
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/status/',
              multipleResponses: [
                {
                  responseBody: {
                    reason: PaymentIncidentReason.UNKNOWN,
                    state: PaymentIncidentState.PAYMENT_FAILED,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_PAYMENT,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PAYMENT_SUCCEEDED,
                  },
                },
              ],
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        clickToResolveOrderPaymentIssue()

        const resolveModal = await screen.findByRole('dialog', {
          name: 'Solve incident',
        })

        clickToRetryPayment()

        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'payment_retry_click',
          {
            order_id: 44051,
          },
        )
        expect(resolveModal).not.toBeInTheDocument()
        expect(
          '/customers/1/orders/44051/payment-incident/resolve/',
        ).toHaveBeenFetched()

        const orderStatus = await screen.findByRole('status', {
          name: 'Prepared',
        })
        expect(orderStatus).toHaveTextContent(
          'Your order is now prepared and charged.',
        )

        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'solve_payment_issue_click',
          {
            order_id: 44051,
            status: 'payment-issue',
          },
        )

        await waitFor(() => {
          expect(Tracker.sendInteraction).toHaveBeenCalledWith(
            'payment_success_view',
            {
              order_id: 44051,
            },
          )
        })
      })

      it('should display payment incident reason in modal when payment fails with reason', async () => {
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: `/customers/1/orders/44051/`,
              responseBody: {
                ...OrderMother.paymentFailed(),
                payment_method: PaymentMethodMother.bizum(true),
              },
            },
            {
              path: `/customers/1/orders/44051/lines/prepared/`,
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [
                  PaymentMethodMother.creditCardVisaValid(),
                  PaymentMethodMother.creditCardMastercardValid(),
                  PaymentMethodMother.bizum(true),
                ],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/',
              responseBody: {
                reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
                payment_method: PaymentMethodMother.bizum(),
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/resolve/',
              method: 'POST',
              status: 202,
              requestBody: {
                payment_method_id: PaymentMethodMother.bizum().id,
              },
              responseBody: {
                code: 'processing_payment',
                authentication_uuid: null,
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/status/',
              multipleResponses: [
                {
                  responseBody: {
                    reason: PaymentIncidentReason.UNKNOWN,
                    state: PaymentIncidentState.PAYMENT_FAILED,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_PAYMENT,
                  },
                },
                {
                  responseBody: {
                    reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
                    state: PaymentIncidentState.PAYMENT_FAILED,
                  },
                },
              ],
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        clickToResolveOrderPaymentIssue()

        const resolveModal = await screen.findByRole('dialog', {
          name: 'Solve incident',
        })

        clickToRetryPayment()

        expect(resolveModal).not.toBeInTheDocument()
        expect(
          '/customers/1/orders/44051/payment-incident/resolve/',
        ).toHaveBeenFetched()

        const paymentFailedModal = await screen.findByRole('dialog', {
          name: 'The transaction could not be carried out',
        })

        const paymentIncidentReason =
          within(paymentFailedModal).getByRole('status')

        expect(paymentIncidentReason).toHaveTextContent(
          'Please check your account balance or spending limit.',
        )

        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'payment_error_view',
          {
            order_id: 44051,
            error_header_displayed:
              'Please check your account balance or spending limit.',
            error_type: PaymentIncidentReason.INSUFFICIENT_FUNDS,
          },
        )
      })

      it('should reactivate polling for payment status on processing_authentication', async () => {
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: `/customers/1/orders/44051/`,
              responseBody: OrderMother.paymentFailed(),
            },
            {
              path: `/customers/1/orders/44051/lines/prepared/`,
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardVisaValid()],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/status/',
              method: 'GET',
              multipleResponses: [
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_AUTHENTICATION,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_AUTHENTICATION,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_AUTHENTICATION,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PAYMENT_SUCCEEDED,
                  },
                },
              ],
            },
            {
              path: '/customers/1/orders/44051/authentication-detail/',
              method: 'GET',
              responseBody: {
                total_amount: '49.99',
                remaining_time: 120,
              },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        const pageLoader = await screen.findByLabelText(
          'Connecting with your bank',
        )

        await waitForElementToBeRemoved(pageLoader, { timeout: 5000 })
        expect(
          '/customers/1/orders/44051/payment-incident/status/',
        ).toHaveBeenFetchedTimes(4) // 1 on load + 3 on polling (3 pending, 1 succeeded to stop polling)
      })

      it('should reactivate polling for payment status on processing_payment', async () => {
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: `/customers/1/orders/44051/`,
              responseBody: OrderMother.paymentFailed(),
            },
            {
              path: `/customers/1/orders/44051/lines/prepared/`,
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardVisaValid()],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/status/',
              method: 'GET',
              multipleResponses: [
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_PAYMENT,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_PAYMENT,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_PAYMENT,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PAYMENT_SUCCEEDED,
                  },
                },
              ],
            },
            {
              path: '/customers/1/orders/44051/authentication-detail/',
              method: 'GET',
              responseBody: {
                total_amount: '49.99',
                remaining_time: 120,
              },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        const pageLoader = await screen.findByLabelText(
          'Connecting with your bank',
        )

        await waitForElementToBeRemoved(pageLoader, { timeout: 5000 })
        expect(
          '/customers/1/orders/44051/payment-incident/status/',
        ).toHaveBeenFetchedTimes(4) // 1 on load + 3 on polling (3 pending, 1 succeeded to stop polling)
      })

      it('should reactivate polling for payment status on authenticating', async () => {
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: `/customers/1/orders/44051/`,
              responseBody: OrderMother.paymentFailed(),
            },
            {
              path: `/customers/1/orders/44051/lines/prepared/`,
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardVisaValid()],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/status/',
              method: 'GET',
              responseBody: {
                state: PaymentIncidentState.AUTHENTICATING,
              },
            },
            {
              path: '/customers/1/orders/44051/authentication-detail/',
              method: 'GET',
              responseBody: {
                total_amount: '49.99',
                remaining_time: 120,
              },
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        const authenticatingModal = await screen.findByRole('dialog', {
          name: 'Open your banking app to authorise €49.99',
        })

        expect(authenticatingModal).toBeInTheDocument()
      })

      it('should retry payment with the current bizum and require REST authentication and show authenticating modal', async () => {
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: `/customers/1/orders/44051/`,
              multipleResponses: [
                {
                  responseBody: {
                    ...OrderMother.paymentFailed(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
                {
                  responseBody: {
                    ...OrderMother.preparedPaid(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
              ],
            },
            {
              path: `/customers/1/orders/44051/lines/prepared/`,
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [
                  PaymentMethodMother.creditCardVisaValid(),
                  PaymentMethodMother.creditCardMastercardValid(),
                  PaymentMethodMother.bizum(),
                ],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/',
              responseBody: {
                reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
                payment_method: PaymentMethodMother.creditCardVisaValid(),
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/resolve/',
              method: 'POST',
              status: 202,
              requestBody: {
                payment_method_id: 4722,
              },
              responseBody: {
                code: 'authentication_required',
                authentication_uuid: 'auth-uuid',
              },
            },
            {
              path: '/customers/1/orders/44051/authentication-detail/',
              method: 'GET',
              responseBody: {
                total_amount: '49.99',
                remaining_time: 120,
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/status/',
              multipleResponses: [
                {
                  responseBody: {
                    state: PaymentIncidentState.PAYMENT_FAILED,
                    reason: PaymentIncidentReason.UNKNOWN,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
              ],
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        clickToResolveOrderPaymentIssue()

        const resolveModal = await screen.findByRole('dialog', {
          name: 'Solve incident',
        })

        clickToRetryPayment()

        const authenticatingModal = await screen.findByRole('dialog', {
          name: 'Open your banking app to authorise €49.99',
        })

        const modalTitle = within(authenticatingModal).getByRole('heading', {
          level: 3,
          name: 'Open your banking app to authorise €49.99',
        })

        expect(resolveModal).not.toBeInTheDocument()
        expect(authenticatingModal).toBeInTheDocument()
        expect(modalTitle).toBeInTheDocument()
        expect(authenticatingModal).toHaveTextContent(
          'Time remaining01min59sec',
        )
        expect(authenticatingModal).toHaveTextContent('Estimated total€49.99')
        expect(authenticatingModal).toHaveTextContent(
          'Amount to authorise€49.99',
        )
        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'psd2_modal_view',
          {
            time_left: 120,
            has_extra_to_authenticate: false,
          },
        )
      })

      it('should retry payment with the current bizum and require REST authentication and fails', async () => {
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: `/customers/1/orders/44051/`,
              multipleResponses: [
                {
                  responseBody: {
                    ...OrderMother.paymentFailed(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
                {
                  responseBody: {
                    ...OrderMother.preparedPaid(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
              ],
            },
            {
              path: `/customers/1/orders/44051/lines/prepared/`,
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [
                  PaymentMethodMother.creditCardVisaValid(),
                  PaymentMethodMother.creditCardMastercardValid(),
                  PaymentMethodMother.bizum(),
                ],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/',
              responseBody: {
                reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
                payment_method: PaymentMethodMother.creditCardVisaValid(),
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/resolve/',
              method: 'POST',
              status: 202,
              requestBody: {
                payment_method_id: 4722,
              },
              responseBody: {
                code: 'authentication_required',
                authentication_uuid: 'auth-uuid',
              },
            },
            {
              path: '/customers/1/orders/44051/authentication-detail/',
              method: 'GET',
              responseBody: {
                total_amount: '49.99',
                remaining_time: 120,
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/status/',
              multipleResponses: [
                {
                  responseBody: {
                    state: PaymentIncidentState.PAYMENT_FAILED,
                    reason: PaymentIncidentReason.UNKNOWN,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATION_FAILED,
                  },
                },
              ],
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        clickToResolveOrderPaymentIssue()

        await screen.findByRole('dialog', {
          name: 'Solve incident',
        })

        clickToRetryPayment()

        const authenticatingModal = await screen.findByRole('dialog', {
          name: 'Open your banking app to authorise €49.99',
        })

        await waitForElementToBeRemoved(authenticatingModal, { timeout: 5000 })
        await waitFor(() => {
          expect(
            '/customers/1/orders/44051/payment-incident/status/',
          ).toHaveBeenFetchedTimes(4) // 1 on load + 3 on polling (2 authenticating, 1 failed)
        })

        const paymentFailedModal = await screen.findByRole('dialog', {
          name: 'The transaction could not be carried out',
        })

        expect(paymentFailedModal).toBeInTheDocument()
        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'authentication_failed_alert_view',
        )
      })

      it('should retry payment with the current bizum and require REST authentication and success', async () => {
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: `/customers/1/orders/44051/`,
              multipleResponses: [
                {
                  responseBody: {
                    ...OrderMother.paymentFailed(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
                {
                  responseBody: {
                    ...OrderMother.paymentFailed(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
                {
                  responseBody: {
                    ...OrderMother.preparedPaid(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
              ],
            },
            {
              path: `/customers/1/orders/44051/lines/prepared/`,
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [
                  PaymentMethodMother.creditCardVisaValid(),
                  PaymentMethodMother.creditCardMastercardValid(),
                  PaymentMethodMother.bizum(),
                ],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/',
              responseBody: {
                reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
                payment_method: PaymentMethodMother.creditCardVisaValid(),
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/resolve/',
              method: 'POST',
              status: 202,
              requestBody: {
                payment_method_id: 4722,
              },
              responseBody: {
                code: 'authentication_required',
                authentication_uuid: 'auth-uuid',
              },
            },
            {
              path: '/customers/1/orders/44051/authentication-detail/',
              method: 'GET',
              responseBody: {
                total_amount: '49.99',
                remaining_time: 120,
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/status/',
              multipleResponses: [
                {
                  responseBody: {
                    state: PaymentIncidentState.PAYMENT_FAILED,
                    reason: PaymentIncidentReason.UNKNOWN,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_PAYMENT,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_PAYMENT,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PAYMENT_SUCCEEDED,
                  },
                },
              ],
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        clickToResolveOrderPaymentIssue()

        await screen.findByRole('dialog', {
          name: 'Solve incident',
        })

        clickToRetryPayment()

        const authenticatingModal = await screen.findByRole('dialog', {
          name: 'Open your banking app to authorise €49.99',
        })
        await waitForElementToBeRemoved(authenticatingModal, { timeout: 5000 })

        const processingModal = await screen.findByLabelText(
          'Connecting with your bank',
        )
        await waitForElementToBeRemoved(processingModal, { timeout: 5000 })

        await waitFor(() => {
          expect(
            '/customers/1/orders/44051/payment-incident/status/',
          ).toHaveBeenFetchedTimes(5) // 1 on load + 4 on polling (1 authenticating, 2 processing, 1 succeeded)
        })

        const orderStatus = await screen.findByRole('status', {
          name: 'Prepared',
        })
        expect(orderStatus).toHaveTextContent(
          'Your order is now prepared and charged.',
        )
      })

      it('should retry payment with the current bizum and require REST authentication and redirect to webview when polling returns fallback_required', async () => {
        vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: `/customers/1/orders/44051/`,
              responseBody: OrderMother.paymentFailed(),
            },
            {
              path: `/customers/1/orders/44051/lines/prepared/`,
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardVisaValid()],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/status/',
              method: 'GET',
              multipleResponses: [
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_AUTHENTICATION,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.FALLBACK_REQUIRED,
                    authentication_uuid: 'auth-uuid',
                  },
                },
              ],
            },
            {
              path: `/customers/1/orders/44051/authentication/?${new URLSearchParams(
                {
                  lang: 'en',
                  wh: 'vlc1',
                  authentication_uuid: 'auth-uuid',
                  ok_url: `http://localhost:3000${TPV_OK_URL}`,
                  ko_url: `http://localhost:3000${TPV_KO_URL}`,
                },
              )}`,
              catchParams: true,
              responseBody: PaymentAuthenticationMother.redsysCard(),
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        await screen.findByRole('dialog', {
          name: 'Connecting with your bank',
        })

        await waitFor(() => {
          expect(PaymentTPV.autoRedirectToPaymentAuth).toHaveBeenCalledWith(
            PaymentAuthenticationMother.redsysCard().params,
          )
        })
      })

      it('should retry payment with the current bizum and require REST authentication and cancel', async () => {
        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: `/customers/1/orders/44051/`,
              multipleResponses: [
                {
                  responseBody: {
                    ...OrderMother.paymentFailed(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
                {
                  responseBody: {
                    ...OrderMother.paymentFailed(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
                {
                  responseBody: {
                    ...OrderMother.preparedPaid(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
              ],
            },
            {
              path: `/customers/1/orders/44051/lines/prepared/`,
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [
                  PaymentMethodMother.creditCardVisaValid(),
                  PaymentMethodMother.creditCardMastercardValid(),
                  PaymentMethodMother.bizum(),
                ],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/',
              responseBody: {
                reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
                payment_method: PaymentMethodMother.creditCardVisaValid(),
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/resolve/',
              method: 'POST',
              status: 202,
              requestBody: {
                payment_method_id: 4722,
              },
              responseBody: {
                code: 'authentication_required',
                authentication_uuid: 'auth-uuid',
              },
            },
            {
              path: '/customers/1/orders/44051/authentication-detail/',
              method: 'GET',
              responseBody: {
                total_amount: '49.99',
                remaining_time: 120,
              },
            },
            {
              path: '/customers/1/orders/44051/authentication/cancel/',
              method: 'PUT',
              delay: 1000,
            },
            {
              path: '/customers/1/orders/44051/payment-incident/status/',
              multipleResponses: [
                {
                  responseBody: {
                    state: PaymentIncidentState.PAYMENT_FAILED,
                    reason: PaymentIncidentReason.UNKNOWN,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
              ],
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        clickToResolveOrderPaymentIssue()

        await screen.findByRole('dialog', {
          name: 'Solve incident',
        })

        clickToRetryPayment()

        const authenticatingModal = await screen.findByRole('dialog', {
          name: 'Open your banking app to authorise €49.99',
        })

        clickToCancelPaymentAuthenticating()

        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'psd2_cancel_click',
        )
        expect(authenticatingModal).not.toBeInTheDocument()
        const processingModal = await screen.findByLabelText(
          'Connecting with your bank',
        )
        await waitForElementToBeRemoved(processingModal, { timeout: 5000 })

        const paymentFailedModal = await screen.findByRole('dialog', {
          name: 'The transaction could not be carried out',
        })
        expect(paymentFailedModal).toBeInTheDocument()
        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'authentication_failed_alert_view',
        )

        await waitFor(() => {
          expect(
            '/customers/1/orders/44051/authentication/cancel/',
          ).toHaveBeenFetched()

          expect(
            '/customers/1/orders/44051/payment-incident/status/',
          ).toHaveBeenFetchedTimes(2) // 1 on load + 1 on polling (1 authenticating) then stopped after cancel
        })
      })

      it('should retry payment with the current bizum and require REST authentication and cancel without race problems', async () => {
        vi.useFakeTimers()

        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: `/customers/1/orders/44051/`,
              multipleResponses: [
                {
                  responseBody: {
                    ...OrderMother.paymentFailed(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
                {
                  responseBody: {
                    ...OrderMother.paymentFailed(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
                {
                  responseBody: {
                    ...OrderMother.preparedPaid(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
              ],
            },
            {
              path: `/customers/1/orders/44051/lines/prepared/`,
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [
                  PaymentMethodMother.creditCardVisaValid(),
                  PaymentMethodMother.creditCardMastercardValid(),
                  PaymentMethodMother.bizum(),
                ],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/',
              responseBody: {
                reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
                payment_method: PaymentMethodMother.creditCardVisaValid(),
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/resolve/',
              method: 'POST',
              status: 202,
              requestBody: {
                payment_method_id: 4722,
              },
              responseBody: {
                code: 'authentication_required',
                authentication_uuid: 'auth-uuid',
              },
            },
            {
              path: '/customers/1/orders/44051/authentication-detail/',
              method: 'GET',
              responseBody: {
                total_amount: '49.99',
                remaining_time: 120,
              },
            },
            {
              path: '/customers/1/orders/44051/authentication/cancel/',
              method: 'PUT',
              delay: 1000,
            },
            {
              path: '/customers/1/orders/44051/payment-incident/status/',
              multipleResponses: [
                {
                  responseBody: {
                    state: PaymentIncidentState.PAYMENT_FAILED,
                    reason: PaymentIncidentReason.UNKNOWN,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                  delay: 1000,
                },
              ],
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        clickToResolveOrderPaymentIssue()

        await screen.findByRole('dialog', {
          name: 'Solve incident',
        })

        clickToRetryPayment()

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
        expect(
          '/customers/1/orders/44051/payment-incident/status/',
        ).toHaveBeenFetchedTimes(3) // 1 on load + 2 on polling (1 authenticating + 1 authenticating returned after cancel) then stopped after cancel

        vi.useRealTimers()
      })

      it('should retry payment with different new bizum', async () => {
        vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')
        vi.spyOn(window.localStorage.__proto__, 'setItem')

        const OK_URL = `/user-area/orders/44051?${new URLSearchParams({
          status: 'success',
          payment_method: 'any',
          payment_flow: 'resolve_payment_incidence',
          payment_authentication_storage_key:
            '10000000-1000-4000-8000-100000000000',
        })}`
        const KO_URL = `/user-area/orders/44051?${new URLSearchParams({
          status: 'failure',
          payment_method: 'any',
          payment_flow: 'resolve_payment_incidence',
          payment_authentication_storage_key:
            '10000000-1000-4000-8000-100000000000',
        })}`

        wrap(App)
          .atPath('/user-area/orders/44051')
          .withNetwork([
            {
              path: `/customers/1/orders/44051/`,
              multipleResponses: [
                {
                  responseBody: {
                    ...OrderMother.paymentFailed(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
                {
                  responseBody: {
                    ...OrderMother.preparedPaid(),
                    payment_method: PaymentMethodMother.bizum(),
                  },
                },
              ],
            },
            {
              path: `/customers/1/orders/44051/lines/prepared/`,
              responseBody: preparedLines,
            },
            {
              path: '/customers/1/orders/44051/payment-incident/',
              responseBody: {
                reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
                payment_method: PaymentMethodMother.creditCardVisaValid(),
              },
            },
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [PaymentMethodMother.creditCardVisaValid()],
              },
            },
            {
              path: '/customers/1/orders/44051/payment-methods/bizum/',
              method: 'POST',
              status: 202,
              requestBody: {
                phone_country_code: '34',
                phone_national_number: '600123456',
                ok_url: `http://localhost:3000${OK_URL}`,
                ko_url: `http://localhost:3000${KO_URL}`,
                flow: 'RESOLVE_PAYMENT_INCIDENT',
              },
            },
            {
              path: '/customers/1/orders/44051/authentication-detail/',
              method: 'GET',
              responseBody: {
                total_amount: '49.99',
                remaining_time: 120,
              },
            },
            {
              path: '/customers/1/orders/44051/payment-incident/status/',
              multipleResponses: [
                {
                  responseBody: {
                    state: PaymentIncidentState.PAYMENT_FAILED,
                    reason: PaymentIncidentReason.UNKNOWN,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.AUTHENTICATING,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_PAYMENT,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PROCESSING_PAYMENT,
                  },
                },
                {
                  responseBody: {
                    state: PaymentIncidentState.PAYMENT_SUCCEEDED,
                  },
                },
              ],
            },
          ])
          .withLogin()
          .mount()

        await screen.findByText('Order 44051')

        clickToResolveOrderPaymentIssue()
        const resolveIncidenceModal = await screen.findByRole('dialog', {
          name: 'Solve incident',
        })

        await clickToModifyPaymentMethodResolvePaymentIncident()
        await clickToAddNewPaymentMethod()
        await selectNewPaymentMethodBizum()
        await fillBizumForm()

        expect(resolveIncidenceModal).not.toBeInTheDocument()

        const authenticatingModal = await screen.findByRole('dialog', {
          name: 'Open your banking app to authorise €49.99',
        })
        await waitForElementToBeRemoved(authenticatingModal, { timeout: 5000 })

        const processingModal = await screen.findByLabelText(
          'Connecting with your bank',
        )
        await waitForElementToBeRemoved(processingModal, { timeout: 5000 })

        await waitFor(() => {
          expect(
            '/customers/1/orders/44051/payment-incident/status/',
          ).toHaveBeenFetchedTimes(5) // 1 on load + 4 on polling (1 authenticating, 2 processing, 1 succeeded)
        })

        const orderStatus = await screen.findByRole('status', {
          name: 'Prepared',
        })
        expect(orderStatus).toHaveTextContent(
          'Your order is now prepared and charged.',
        )
      })
    })
  })

  describe('CreditCard payment method', () => {
    it('should retry payment with the current credit card', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            multipleResponses: [
              {
                responseBody: OrderMother.paymentFailed(),
              },
              {
                responseBody: OrderMother.preparedPaid(),
              },
            ],
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
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
          {
            path: '/customers/1/orders/44051/payment-incident/resolve/',
            method: 'POST',
            requestBody: {
              payment_method_id: PaymentMethodMother.creditCardVisaValid().id,
            },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()
      const resolveIncidenceModal = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      await clickToRetryPayment()

      expect(resolveIncidenceModal).not.toBeInTheDocument()
      expect(
        '/customers/1/orders/44051/payment-incident/resolve/',
      ).toHaveBeenFetched()

      const orderStatus = await screen.findByRole('status', {
        name: 'Prepared',
      })
      expect(orderStatus).toHaveTextContent(
        'Your order is now prepared and charged.',
      )

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'change_payment_method_finished',
        {
          payment_digits: '**** 6017',
          payment_id: PaymentMethodMother.creditCardVisaValid().id,
        },
      )
    })

    it('should retry payment with the current credit card and fail', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            responseBody: {
              ...OrderMother.paymentFailed(),
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
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
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/resolve/',
            method: 'POST',
            requestBody: {
              payment_method_id: PaymentMethodMother.creditCardVisaValid().id,
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/status/',
            multipleResponses: [
              {
                responseBody: {
                  reason: PaymentIncidentReason.UNKNOWN,
                  status: PaymentIncidentStatus.FAILED,
                },
              },
              {
                responseBody: {
                  status: PaymentIncidentStatus.PENDING,
                },
              },
              {
                responseBody: {
                  reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
                  status: PaymentIncidentStatus.FAILED,
                },
              },
            ],
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()

      const resolveModal = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      expect(resolveModal).toBeInTheDocument()

      clickToRetryPayment()

      expect(resolveModal).not.toBeInTheDocument()
      expect(
        '/customers/1/orders/44051/payment-incident/resolve/',
      ).toHaveBeenFetched()

      const paymentFailedModal = await screen.findByRole('dialog', {
        name: 'The transaction could not be carried out',
      })
      expect(paymentFailedModal).toBeInTheDocument()
    })

    it('should retry payment with different existent credit card', async () => {
      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            multipleResponses: [
              {
                responseBody: OrderMother.paymentFailed(),
              },
              {
                responseBody: OrderMother.preparedPaid(),
              },
            ],
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
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
          {
            path: '/customers/1/orders/44051/payment-incident/resolve/',
            method: 'POST',
            requestBody: {
              payment_method_id:
                PaymentMethodMother.creditCardMastercardValid().id,
            },
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()
      const resolveIncidenceModal = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      await clickToModifyPaymentMethodResolvePaymentIncident()
      await selectExistentPaymentMethod('Mastercard, **** 6023, Expires 01/23')
      await clickToRetryPayment()

      expect(resolveIncidenceModal).not.toBeInTheDocument()

      await waitFor(() => {
        expect(
          '/customers/1/orders/44051/payment-incident/resolve/',
        ).toHaveBeenFetched()
      })

      const orderStatus = await screen.findByRole('status', {
        name: 'Prepared',
      })
      expect(orderStatus).toHaveTextContent(
        'Your order is now prepared and charged.',
      )

      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'change_payment_method_finished',
        {
          payment_digits: '**** 6023',
          payment_id: PaymentMethodMother.creditCardMastercardValid().id,
        },
      )
    })

    it('should retry payment with different new credit card and ko', async () => {
      const originalLocation = window.location

      Object.defineProperty(window, 'location', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: {
          ...originalLocation,
          replace: vi.fn(),
        },
      })

      const KO_URL = `/user-area/orders/44051?${new URLSearchParams({
        status: 'failure',
        payment_method: 'any',
        payment_flow: 'resolve_payment_incidence',
        payment_authentication_storage_key:
          '10000000-1000-4000-8000-100000000000',
      })}`

      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            responseBody: OrderMother.paymentFailed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [PaymentMethodMother.creditCardVisaValid()],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-methods/card/',
            method: 'POST',
            requestBody: {
              ok_url: 'http://localhost:3000/sca_token_authn_ok.html',
              ko_url: 'http://localhost:3000/sca_token_authn_ko.html',
              flow: 'RESOLVE_PAYMENT_INCIDENT',
            },
            responseBody: PaymentAuthenticationMother.redsysCard(),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()
      const dialog = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      await clickToModifyPaymentMethodResolvePaymentIncident()
      await clickToAddNewPaymentMethod()
      await selectNewPaymentMethodCard()

      await within(dialog).findByTitle('payment-card-tpv-iframe')
      rejectAddPaymentMethod()

      expect(window.location.replace).toHaveBeenCalledWith(
        `http://localhost:3000${KO_URL}`,
      )
    })

    it('should retry payment with different new credit card and ok', async () => {
      const originalLocation = window.location

      Object.defineProperty(window, 'location', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: {
          ...originalLocation,
          replace: vi.fn(),
        },
      })

      const OK_URL = `/user-area/orders/44051?${new URLSearchParams({
        status: 'success',
        payment_method: 'any',
        payment_flow: 'resolve_payment_incidence',
        payment_authentication_storage_key:
          '10000000-1000-4000-8000-100000000000',
      })}`

      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            responseBody: OrderMother.paymentFailed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [PaymentMethodMother.creditCardVisaValid()],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-methods/card/',
            method: 'POST',
            requestBody: {
              ok_url: 'http://localhost:3000/sca_token_authn_ok.html',
              ko_url: 'http://localhost:3000/sca_token_authn_ko.html',
              flow: 'RESOLVE_PAYMENT_INCIDENT',
            },
            responseBody: PaymentAuthenticationMother.redsysCard(),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()
      const dialog = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      await clickToModifyPaymentMethodResolvePaymentIncident()
      await clickToAddNewPaymentMethod()
      await selectNewPaymentMethodCard()

      await within(dialog).findByTitle('payment-card-tpv-iframe')
      confirmAddPaymentMethod()

      expect(window.location.replace).toHaveBeenCalledWith(
        `http://localhost:3000${OK_URL}`,
      )
    })

    it('should launch tpv on authentication required on retry payment with credit card', async () => {
      vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

      wrap(App)
        .atPath('/user-area/orders/44051')
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            responseBody: {
              ...OrderMother.paymentFailed(),
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
            responseBody: preparedLines,
          },
          {
            path: '/customers/1/orders/44051/payment-incident/',
            responseBody: {
              reason: PaymentIncidentReason.INSUFFICIENT_FUNDS,
              payment_method: PaymentMethodMother.creditCardVisaValid(),
            },
          },
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [PaymentMethodMother.creditCardVisaValid()],
            },
          },
          {
            path: '/customers/1/orders/44051/payment-incident/resolve/',
            method: 'POST',
            status: 400,
            requestBody: {
              payment_method_id: PaymentMethodMother.creditCardVisaValid().id,
            },
            responseBody: {
              errors: [
                PaymentAuthenticationRequiredException.toJSON({
                  authentication_uuid: 'auth-uuid',
                }),
              ],
            },
          },
          {
            path: `/customers/1/orders/44051/authentication/?${new URLSearchParams(
              {
                lang: 'en',
                wh: 'vlc1',
                authentication_uuid: 'auth-uuid',
                ok_url: `http://localhost:3000${TPV_OK_URL}`,
                ko_url: `http://localhost:3000${TPV_KO_URL}`,
              },
            )}`,
            catchParams: true,
            responseBody: PaymentAuthenticationMother.redsysCard(),
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      clickToResolveOrderPaymentIssue()
      const resolveIncidenceModal = await screen.findByRole('dialog', {
        name: 'Solve incident',
      })

      await clickToRetryPayment()

      expect(resolveIncidenceModal).not.toBeInTheDocument()

      await waitFor(() => {
        expect(PaymentTPV.autoRedirectToPaymentAuth).toHaveBeenCalledWith(
          PaymentAuthenticationMother.redsysCard().params,
        )
      })
    })
  })

  describe('TPV callbacks', () => {
    it('should show error modal on tpv ko_url', async () => {
      wrap(App)
        .atPath(TPV_KO_URL)
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            responseBody: OrderMother.paymentFailed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
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
            path: '/customers/1/orders/44051/payment-incident/status/',
            responseBody: {
              reason: PaymentIncidentReason.UNKNOWN,
              status: PaymentIncidentStatus.FAILED,
            },
          },
        ])
        .withLogin()
        .mount()

      const paymentFailedModal = await screen.findByRole('dialog', {
        name: 'The transaction could not be carried out',
      })
      expect(paymentFailedModal).toBeInTheDocument()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
        status: 'failed',
        user_flow: 'payment_issue',
        payment_authentication_uuid: 'auth-uuid',
      })
    })

    it('should reactivate the polling on tpv ok_url and show error on failed payment', async () => {
      wrap(App)
        .atPath(TPV_OK_URL)
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            responseBody: OrderMother.paymentFailed(),
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
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
            path: '/customers/1/orders/44051/payment-incident/status/',
            multipleResponses: [
              {
                responseBody: {
                  status: PaymentIncidentStatus.PENDING,
                },
              },
              {
                responseBody: {
                  status: PaymentIncidentStatus.PENDING,
                },
              },
              {
                responseBody: {
                  status: PaymentIncidentStatus.PENDING,
                },
              },
              {
                responseBody: {
                  status: PaymentIncidentStatus.PENDING,
                },
              },
              {
                responseBody: {
                  reason: PaymentIncidentReason.UNKNOWN,
                  status: PaymentIncidentStatus.FAILED,
                },
              },
            ],
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const pageLoader = await screen.findByLabelText(
        'Connecting with your bank',
      )

      await waitForElementToBeRemoved(pageLoader, { timeout: 5000 })

      expect(
        '/customers/1/orders/44051/payment-incident/status/',
      ).toHaveBeenFetchedTimes(5) // 1 on load + 4 on polling (3 pending, 1 failed to stop polling)

      const paymentFailedModal = await screen.findByRole('dialog', {
        name: 'The transaction could not be carried out',
      })
      expect(paymentFailedModal).toBeInTheDocument()
      const paymentIncidentReason =
        within(paymentFailedModal).queryByRole('status')

      expect(paymentIncidentReason).not.toBeInTheDocument()
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
        status: 'success',
        user_flow: 'payment_issue',
        payment_authentication_uuid: 'auth-uuid',
      })
    })

    it('should reactivate the polling on tpv ok_url and show success on succeeded payment', async () => {
      wrap(App)
        .atPath(TPV_OK_URL)
        .withNetwork([
          {
            path: `/customers/1/orders/44051/`,
            multipleResponses: [
              {
                responseBody: OrderMother.paymentFailed(),
              },
              {
                responseBody: OrderMother.preparedPaid(),
              },
            ],
          },
          {
            path: `/customers/1/orders/44051/lines/prepared/`,
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
            path: '/customers/1/orders/44051/payment-incident/status/',
            multipleResponses: [
              {
                responseBody: {
                  status: PaymentIncidentStatus.PENDING,
                },
              },
              {
                responseBody: {
                  status: PaymentIncidentStatus.PENDING,
                },
              },
              {
                responseBody: {
                  status: PaymentIncidentStatus.PENDING,
                },
              },
              {
                responseBody: {
                  status: PaymentIncidentStatus.PENDING,
                },
              },
              {
                responseBody: {
                  status: PaymentIncidentStatus.SUCCEEDED,
                },
              },
            ],
          },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Order 44051')

      const pageLoader = await screen.findByLabelText(
        'Connecting with your bank',
      )

      await waitForElementToBeRemoved(pageLoader, { timeout: 5000 })

      expect(
        '/customers/1/orders/44051/payment-incident/status/',
      ).toHaveBeenFetchedTimes(5) // 1 on load + 4 on polling (3 pending, 1 failed to stop polling)

      await waitFor(async () => {
        const orderStatus = await screen.findByRole('status', {
          name: 'Prepared',
        })
        expect(orderStatus).toHaveTextContent(
          'Your order is now prepared and charged.',
        )
        expect(Tracker.sendInteraction).toHaveBeenCalledWith(
          'payment_success_view',
          {
            order_id: 44051,
          },
        )
      })

      expect(Tracker.sendInteraction).toHaveBeenCalledWith('end_psd2_flow', {
        status: 'success',
        user_flow: 'payment_issue',
        payment_authentication_uuid: 'auth-uuid',
      })
    })
  })
})
