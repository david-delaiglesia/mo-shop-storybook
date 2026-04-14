import { screen, within } from '@testing-library/react'

import { closeTab } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import {
  clickToAddNewPaymentMethod,
  clickToModifyPaymentMethod,
  clickToSavePaymentMethod,
  selectNewPaymentMethodCard,
} from 'pages/__tests__/helper'
import {
  findPaymentMethodSection,
  selectExistentPaymentMethod,
} from 'pages/__tests__/helpers/payment'
import { savePaymentMethod } from 'pages/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Payment', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  const { host, protocol } = window.location

  const urlOk = `${protocol}//${host}/sca_token_authn_ok.html`
  const urlKo = `${protocol}//${host}/sca_token_authn_ko.html`

  const tokenAuthRequestBody = {
    ok_url: urlOk,
    ko_url: urlKo,
    checkout_auto_confirm: 'no',
  }

  it('should allow to edit the payment method when the user has cards', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.filled(),
      },
      {
        path: '/customers/1/checkouts/5/payment-method/',
        method: 'put',
        requestBody: { payment_method: { id: 4687 } },
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
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await clickToModifyPaymentMethod()
    await clickToAddNewPaymentMethod()
    await clickToSavePaymentMethod()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_payment_method_click',
      {
        checkout_id: 5,
        has_card: true,
        purchase_id: 5,
      },
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_payment_method_finished',
      {
        payment_digits: '**** 6017',
        payment_id: 4721,
      },
    )
  })

  it('should not display the payment info if there is no delivery info', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.withoutDeliveryInfo(),
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Add where you want to receive your order.')

    expect(screen.queryByText('**** 6007')).not.toBeInTheDocument()
    expect(screen.queryByText('Valid until 01/23')).not.toBeInTheDocument()
  })

  it('should not display the payment info if there is no contact info', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.withoutContactInfo(),
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Add a phone number')

    expect(screen.queryByText('**** 6007')).not.toBeInTheDocument()
    expect(screen.queryByText('Valid until 01/23')).not.toBeInTheDocument()
  })

  it('should allow to select a payment method from the payment list', async () => {
    const originalCard = '**** 6007'
    const newCard = '**** 6023'
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        multipleResponses: [
          {
            responseBody: {
              ...CheckoutMother.filled(),
            },
          },
          {
            responseBody: {
              ...CheckoutMother.withMastercard(),
            },
          },
        ],
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
        path: '/customers/1/checkouts/5/payment-method/',
        method: 'put',
        requestBody: { payment_method: { id: 4720 } },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    const paymentSection = await findPaymentMethodSection()

    await clickToModifyPaymentMethod()
    await selectExistentPaymentMethod('Mastercard, **** 6023, Expires 01/23')

    savePaymentMethod()
    await within(paymentSection).findByRole('button', { name: 'Modify' })

    expect(paymentSection).toHaveTextContent(newCard)
    expect(paymentSection).not.toHaveTextContent(originalCard)
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'change_payment_method_finished',
      {
        payment_digits: '**** 6023',
        payment_id: 4720,
      },
    )
  })

  it('should set the payment method in the current checkout after adding a new one', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
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
      {
        path: '/customers/1/checkouts/5/payment-cards/new/',
        method: 'post',
        requestBody: tokenAuthRequestBody,
        responseBody: PaymentAuthenticationMother.cecaCard(),
      },
      {
        path: '/customers/1/checkouts/5/payment-method/',
        method: 'put',
        requestBody: { payment_method: { id: 4687 } },
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await clickToModifyPaymentMethod()
    await clickToAddNewPaymentMethod()
    await clickToSavePaymentMethod()

    const paymentSection = await findPaymentMethodSection()

    expect(
      within(paymentSection).getByRole('button', { name: 'Modify' }),
    ).toBeInTheDocument()

    expect(paymentSection).toHaveTextContent('**** 6017Expires 01/23')
    expect('/customers/1/checkouts/5/payment-method/').toHaveBeenFetchedWith({
      body: {
        payment_method: { id: 4721 },
      },
    })
  })

  it('should add a card without the alert after closing the alert by closing the tab', async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.filled(),
      },
      {
        path: '/customers/1/checkouts/5/payment-cards/new/',
        method: 'post',
        requestBody: tokenAuthRequestBody,
        responseBody: PaymentAuthenticationMother.cecaCard(),
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
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await findPaymentMethodSection()
    closeTab()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'system_dismiss_checkout_alert_view',
    )
  })

  it("should display a warning telling the user that adding a new card will redirect them to the bank's website for tokenization authentication", async () => {
    const responses = [
      { path: '/customers/1/orders/', responseBody: { results: [] } },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.filled(),
      },
      { path: '/customers/1/orders/' },
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
        path: '/customers/1/checkouts/5/payment-cards/new/',
        method: 'post',
        requestBody: tokenAuthRequestBody,
        responseBody: PaymentAuthenticationMother.cecaCard(),
      },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await clickToModifyPaymentMethod()
    await clickToAddNewPaymentMethod()
    await selectNewPaymentMethodCard()

    const dialogAddPaymentMethod = await screen.findByRole('dialog', {
      name: 'Add payment method',
    })

    expect(dialogAddPaymentMethod).toHaveTextContent(
      'The card will be saved as a payment method. You will be able to delete it when you wish from your account.',
    )
  })
})
