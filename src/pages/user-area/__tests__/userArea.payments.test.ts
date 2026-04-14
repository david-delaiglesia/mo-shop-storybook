import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react'

import {
  clickElementDefaultButton,
  clickElementDeleteButton,
  confirmRemoveElementAlert,
  getListItemCardByText,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { PhoneWithoutBizumException } from 'app/payment'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import {
  clickToAddNewPaymentMethod,
  fillBizumForm,
  selectNewPaymentMethodBizum,
  selectNewPaymentMethodCard,
} from 'pages/__tests__/helper'
import { confirmAddPaymentMethod, rejectAddPaymentMethod } from 'pages/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('User Area - Payments', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.resetAllMocks()
    localStorage.clear()
  })

  it('should see the proper information', async () => {
    wrap(App)
      .atPath('/user-area/payments')
      .withNetwork([
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
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Payment methods', level: 1 })

    const sectionDefaultPaymentMethod = screen.getByRole('region', {
      name: 'Regular payment method',
    })
    const sectionOtherPaymentMethods = screen.getByRole('region', {
      name: 'Other payment methods',
    })

    const otherPaymentMethods = within(sectionOtherPaymentMethods).getAllByRole(
      'listitem',
    )

    const [firstCard, secondCard] = otherPaymentMethods

    const addPaymentButton = screen.getByRole('button', {
      name: 'Add payment method',
    })

    expect(addPaymentButton).toBeInTheDocument()

    expect(sectionDefaultPaymentMethod).toHaveTextContent(
      '**** 6017Expires 01/23',
    )

    expect(otherPaymentMethods).toHaveLength(2)
    expect(firstCard).toHaveTextContent('**** 6023Expires 01/23')
    expect(secondCard).toHaveTextContent('+34 700000000Bizum')

    expect(Tracker.sendViewChange).toHaveBeenCalledWith('payments')
  })

  it('should handle an error if the request fails', async () => {
    const responses = [
      {
        path: '/customers/1/payment-cards/',
        status: 404,
        responseBody: { errors: [] },
      },
    ]
    wrap(App)
      .atPath('/user-area/payments')
      .withNetwork(responses)
      .withLogin()
      .mount()

    expect(
      await screen.findByText(
        'Sorry, it is not possible to find the page you are looking for.',
      ),
    ).toBeInTheDocument()
  })

  describe('CTA when there are no payment methods', () => {
    it('should show the CTA if the user has not payments', async () => {
      wrap(App)
        .atPath('/user-area/payments')
        .withNetwork([
          {
            path: '/customers/1/payment-cards/?lang=en&wh=vlc1',
            responseBody: {
              results: [],
            },
            catchParams: true,
          },
        ])
        .withLogin()
        .mount()

      const paymentDisclaimerTitle = await screen.findByRole('heading', {
        name: 'No payment method',
        level: 2,
      })
      const paymentDisclaimerMessage = await screen.findByText(
        'Add a payment method to pay for your orders',
      )
      const paymentDisclaimerAction = await screen.findByRole('button', {
        name: 'Add payment method',
      })

      expect(paymentDisclaimerTitle).toBeInTheDocument()
      expect(paymentDisclaimerMessage).toBeInTheDocument()
      expect(paymentDisclaimerAction).toBeInTheDocument()
    })

    it('should show the new add payment method modal on click to CTA', async () => {
      const { host, protocol } = window.location
      const urlOk = `${protocol}//${host}/payment_ok.html?url=${window.location}`
      const urlKo = `${protocol}//${host}/payment_ko.html?url=${window.location}`

      wrap(App)
        .atPath('/user-area/payments')
        .withNetwork([
          {
            path: '/customers/1/payment-cards/?lang=en&wh=vlc1',
            responseBody: {
              results: [],
            },
            catchParams: true,
          },
          {
            path: `/customers/1/payment-cards/new/?ok_url=${urlOk}&ko_url=${urlKo}&lang=es&wh=vlc1`,
            responseBody: PaymentAuthenticationMother.redsysCard(),
          },
        ])
        .withLogin()
        .mount()

      await clickToAddNewPaymentMethod()
      const dialogAddPaymentMethod = await screen.findByRole('dialog', {
        name: 'Add payment method',
      })

      expect(dialogAddPaymentMethod).toBeInTheDocument()
    })
  })

  it('should be able to delete a payment', async () => {
    wrap(App)
      .atPath('/user-area/payments')
      .withNetwork([
        {
          path: '/customers/1/payment-cards/',
          multipleResponses: [
            {
              responseBody: {
                results: [
                  PaymentMethodMother.creditCardVisaValid(),
                  PaymentMethodMother.creditCardMastercardValid(false),
                ],
              },
            },
            {
              responseBody: {
                results: [PaymentMethodMother.creditCardVisaValid()],
              },
            },
          ],
        },
        {
          method: 'delete',
          path: `/customers/1/payment-cards/${PaymentMethodMother.creditCardMastercardValid(false).id}/`,
          status: 204,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Payment methods', { selector: 'h1' })
    const paymentCardToDelete = getListItemCardByText('**** 6023')
    clickElementDeleteButton('**** 6023')
    const alert = await screen.findByRole('dialog', {
      name: 'Delete payment method. Are you sure you want to remove the payment method?',
    })
    expect(alert).toHaveTextContent(
      'Are you sure you want to remove the payment method?',
    )
    confirmRemoveElementAlert()

    await waitForElementToBeRemoved(() =>
      screen.queryByText('Other payment methods'),
    )
    expect(paymentCardToDelete).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'delete_payment_method_click',
      {
        payment_method_id: 4720,
        payment_method: '**** 6023',
      },
    )

    const defaultPaymentMethodSection = screen.getByRole('region', {
      name: 'Regular payment method',
    })
    const defaultPaymentCard = within(
      defaultPaymentMethodSection,
    ).getByLabelText('Visa, **** 6017, Expires 01/23')

    expect(defaultPaymentCard).toHaveFocus()
  })

  it('should be able to change the default payment', async () => {
    wrap(App)
      .atPath('/user-area/payments')
      .withNetwork([
        {
          path: '/customers/1/payment-cards/',
          multipleResponses: [
            {
              responseBody: {
                results: [
                  PaymentMethodMother.creditCardVisaValid(true),
                  PaymentMethodMother.creditCardMastercardValid(false),
                ],
              },
            },
            {
              responseBody: {
                results: [
                  PaymentMethodMother.creditCardVisaValid(false),
                  PaymentMethodMother.creditCardMastercardValid(true),
                ],
              },
            },
          ],
        },
        {
          method: 'put',
          path: `/customers/1/payment-cards/${PaymentMethodMother.creditCardMastercardValid().id}/`,
          requestBody: { default_card: true },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Payment methods', { selector: 'h1' })

    clickElementDefaultButton('**** 6023')

    await waitFor(() => {
      expect('/customers/1/payment-cards/').toHaveBeenFetchedTimes(2)
    })

    const defaultPaymentMethodSection = screen.getByRole('region', {
      name: 'Regular payment method',
    })

    const defaultPaymentCard = await within(
      defaultPaymentMethodSection,
    ).findByLabelText('Mastercard, **** 6023, Expires 01/23')

    expect(defaultPaymentCard).toHaveFocus()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'make_default_payment_click',
      {
        payment_digits: '6023',
        payment_id: 4720,
        payment_type: 'mastercard',
      },
    )
  })

  describe('Add new payment method Card', () => {
    it('should show error on fail adding a new payment method card', async () => {
      wrap(App)
        .atPath('/user-area/payments')
        .withNetwork([
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [],
            },
          },
          {
            path: `/customers/1/payment-cards/new/`,
            responseBody: PaymentAuthenticationMother.redsysCard(),
          },
        ])
        .withLogin()
        .mount()

      await clickToAddNewPaymentMethod()
      const dialogAddPaymentMethod = await screen.findByRole('dialog', {
        name: 'Add payment method',
      })
      await selectNewPaymentMethodCard()

      await screen.findByTitle('payment-card-tpv-iframe')
      rejectAddPaymentMethod()

      const paymentFailedDialog = await screen.findByRole('dialog', {
        name: "We're sorry, we could not save the card.. It looks like there was a problem with the bank authorisation. You can try with another card or find more information in the Help section",
      })

      expect(dialogAddPaymentMethod).not.toBeInTheDocument()
      expect(paymentFailedDialog).toHaveTextContent(
        "We're sorry, we could not save the card.",
      )
      expect(paymentFailedDialog).toHaveTextContent(
        'It looks like there was a problem with the bank authorisation. You can try with another card or find more information in the Help section',
      )
    })

    it('should show ok and refetch on success adding a new payment method card', async () => {
      wrap(App)
        .atPath('/user-area/payments')
        .withNetwork([
          {
            path: '/customers/1/payment-cards/',
            multipleResponses: [
              {
                responseBody: {
                  results: [],
                },
              },
              {
                responseBody: {
                  results: [],
                },
              },
              {
                responseBody: {
                  results: [PaymentMethodMother.creditCardVisaValid()],
                },
              },
            ],
          },
          {
            path: `/customers/1/payment-cards/new/`,
            responseBody: PaymentAuthenticationMother.redsysCard(),
          },
        ])
        .withLogin()
        .mount()

      await clickToAddNewPaymentMethod()
      const dialogAddPaymentMethod = await screen.findByRole('dialog', {
        name: 'Add payment method',
      })
      await selectNewPaymentMethodCard()

      await screen.findByTitle('payment-card-tpv-iframe')
      confirmAddPaymentMethod()

      const sectionDefaultPaymentMethod = await screen.findByRole('region', {
        name: 'Regular payment method',
      })

      expect(dialogAddPaymentMethod).not.toBeInTheDocument()
      expect(sectionDefaultPaymentMethod).toHaveTextContent(
        '**** 6017Expires 01/23',
      )

      const defaultPaymentMethodSection = screen.getByRole('region', {
        name: 'Regular payment method',
      })
      const defaultPaymentCard = within(
        defaultPaymentMethodSection,
      ).getByLabelText('Visa, **** 6017, Expires 01/23')

      expect(defaultPaymentCard).toHaveFocus()
    })
  })

  describe('Add new payment method Bizum', () => {
    it.each(['invalid-phone-number', '123456789', '+36666666666', ''])(
      'should has valid phone format to allow submit',
      async (phoneNumber) => {
        wrap(App)
          .atPath('/user-area/payments')
          .withNetwork([
            {
              path: '/customers/1/payment-cards/',
              responseBody: {
                results: [],
              },
            },
          ])
          .withLogin()
          .mount()

        await clickToAddNewPaymentMethod()
        const dialogAddPaymentMethod = await screen.findByRole('dialog', {
          name: 'Add payment method',
        })
        await selectNewPaymentMethodBizum()
        await fillBizumForm(phoneNumber, false)

        const submitButton = within(dialogAddPaymentMethod).getByRole(
          'button',
          {
            name: 'Continue',
          },
        )

        expect(submitButton).toBeDisabled()
      },
    )

    it('should show error on phone_without_bizum exception', async () => {
      wrap(App)
        .atPath('/user-area/payments')
        .withNetwork([
          {
            path: '/customers/1/payment-cards/',
            responseBody: {
              results: [],
            },
          },
          {
            path: `/customers/1/payment-methods/bizum/`,
            method: 'post',
            status: 400,
            requestBody: {
              phone_country_code: '34',
              phone_national_number: '600123456',
            },
            responseBody: {
              errors: [PhoneWithoutBizumException.toJSON()],
            },
          },
        ])
        .withLogin()
        .mount()

      await clickToAddNewPaymentMethod()
      const dialogAddPaymentMethod = await screen.findByRole('dialog', {
        name: 'Add payment method',
      })
      await selectNewPaymentMethodBizum()
      await fillBizumForm()

      const errorDialog = await screen.findByRole('dialog', {
        name: '+34 600 12 34 56 is not linked to Bizum',
      })

      expect(dialogAddPaymentMethod).not.toBeInTheDocument()
      expect(errorDialog).toBeInTheDocument()
    })

    it('should show ok and refetch on success adding a new payment method bizum', async () => {
      wrap(App)
        .atPath('/user-area/payments')
        .withNetwork([
          {
            path: '/customers/1/payment-cards/',
            multipleResponses: [
              {
                responseBody: {
                  results: [],
                },
              },
              {
                responseBody: {
                  results: [],
                },
              },
              {
                responseBody: {
                  results: [PaymentMethodMother.bizum()],
                },
              },
            ],
          },
          {
            path: `/customers/1/payment-methods/bizum/`,
            method: 'post',
            status: 201,
            requestBody: {
              phone_country_code: '34',
              phone_national_number: '600123456',
            },
          },
        ])
        .withLogin()
        .mount()

      await clickToAddNewPaymentMethod()
      const dialogAddPaymentMethod = await screen.findByRole('dialog', {
        name: 'Add payment method',
      })
      await selectNewPaymentMethodBizum()
      await fillBizumForm()

      const sectionDefaultPaymentMethod = await screen.findByRole('region', {
        name: 'Regular payment method',
      })

      expect(dialogAddPaymentMethod).not.toBeInTheDocument()
      expect(sectionDefaultPaymentMethod).toHaveTextContent(
        '+34 700000000Bizum',
      )

      const defaultPaymentMethodSection = screen.getByRole('region', {
        name: 'Regular payment method',
      })
      const defaultPaymentCard = within(
        defaultPaymentMethodSection,
      ).getByLabelText('Bizum, +34 700000000, Bizum')

      expect(defaultPaymentCard).toHaveFocus()
    })
  })
})
