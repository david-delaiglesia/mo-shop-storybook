import { act, screen, waitFor, within } from '@testing-library/react'

import {
  authoriseMitTermsModal,
  closeTab,
  confirmAddressForm,
  confirmSlot,
  confirmTokenAuthnScaChallenge,
  fillPhone,
  saveChanges,
  selectFirstAvailableDay,
  selectSlot,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { AddressResponsesBuilder } from '__tests__/addresses/AddressResponsesBuilder'
import { DeliveryAreaResponsesBuilder } from '__tests__/delivery-area/DeliveryAreaResponsesBuilder'
import { App, history } from 'app'
import { ADDRESS_ACCURACY } from 'app/address'
import {
  address,
  addressFormFill,
  addressRequest,
  addressRequestAccuracy,
  addressResponse,
} from 'app/address/__scenarios__/address'
import { CartMother } from 'app/cart/__scenarios__/CartMother'
import { expensiveCart } from 'app/cart/__scenarios__/cart'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { slots } from 'app/delivery-area/__scenarios__/slots'
import { OrderMother } from 'app/order/__scenarios__/OrderMother'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import {
  fillManualAddressForm,
  selectNewPaymentMethodCard,
} from 'pages/__tests__/helper'
import {
  confirmCheckout,
  continueCheckoutWithTokenAuth,
} from 'pages/__tests__/helpers/checkout'
import { Storage } from 'services/storage'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
  })

  it('should be able to confirm a checkout', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            { responseBody: CheckoutMother.filled() },
            { responseBody: CheckoutMother.confirmed() },
          ],
        },
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/orders/',
          method: 'post',
          responseBody: CheckoutMother.confirmed(),
        },
        {
          path: '/customers/1/orders/44051/',
          responseBody: OrderMother.confirmed(),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Checkout', level: 1 })

    expect(Support.showButton).toHaveBeenCalledWith('/checkout/5')
    expect(Support.hideButton).not.toHaveBeenCalled()

    await confirmCheckout()
    await screen.findByRole('region', {
      name: 'Order 44051 confirmed',
    })

    expect(
      screen.queryByText('Where do you want to receive your order?'),
    ).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('summary_view', {
      has_payment_method: true,
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'finish_checkout_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        price: '75.46',
        is_valid: true,
        has_payment_method: true,
      },
    )
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '10000000-1000-4000-8000-100000000000',
        lines: [],
      },
    })
  })

  it('displays the correct sections for a new checkout', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.empty(),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Checkout', level: 1 })

    const deliverySection = screen.getByRole('region', { name: 'Delivery' })
    expect(
      within(deliverySection).getByRole('heading', {
        name: 'Delivery',
        level: 2,
      }),
    ).toBeInTheDocument()
    expect(deliverySection).not.toHaveAttribute('aria-disabled')

    const contactSection = screen.getByRole('region', { name: 'Phone' })
    expect(
      within(contactSection).getByRole('heading', {
        name: 'Phone',
        level: 2,
      }),
    ).toBeInTheDocument()
    expect(contactSection).toHaveAttribute('aria-disabled', 'true')

    const summarySection = screen.getByRole('region', { name: 'Summary' })
    expect(
      within(summarySection).getByRole('heading', {
        name: 'Summary',
        level: 2,
      }),
    ).toBeInTheDocument()
  })

  it('should be able to confirm a new checkout', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/cart/', responseBody: CartMother.simple() },
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            { responseBody: CheckoutMother.empty() },
            {
              responseBody: {
                ...CheckoutMother.withoutSlot(),
                payment_method: null,
              },
            },
            {
              responseBody: CheckoutMother.withoutPaymentMethod(),
            },
            {
              responseBody: CheckoutMother.withoutPaymentMethod(),
            },
            {
              responseBody: CheckoutMother.confirmed(),
            },
          ],
        },
        { path: '/customers/1/addresses/1/slots/', responseBody: slots },
        {
          path: '/customers/1/checkouts/5/delivery-info/',
          method: 'put',
          requestBody: {
            address: {
              id: 1,
              address: 'Calle Arquitecto Mora, 10',
              address_detail: 'Piso 8 Puerta 14',
              comments: 'Comments',
              entered_manually: true,
              latitude: '39.47318090',
              longitude: '-0.36310200',
              postal_code: '46010',
              town: 'València',
            },
            slot: slots.results[0],
          },
          responseBody: CheckoutMother.withoutContactInfo(),
        },
        {
          path: '/customers/1/checkouts/5/phone-number/',
          method: 'put',
          requestBody: {
            phone_country_code: '34',
            phone_national_number: '645 78 59 24',
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
        {
          path: '/customers/1/payment-cards/',
          responseBody: {
            results: [],
          },
        },
        {
          path: '/customers/1/checkouts/5/payment-method/',
          method: 'put',
          requestBody: { payment_method: { id: 4687 } },
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
        {
          path: '/customers/1/addresses/1/make_default/',
          method: 'patch',
        },
        ...new AddressResponsesBuilder()
          .addEmptyResponse()
          .addAccuracyResponse(addressRequestAccuracy, ADDRESS_ACCURACY.HIGH)
          .addCreationResponse(addressRequest, addressResponse)
          .build(),
        ...new DeliveryAreaResponsesBuilder()
          .addPostalCodeValidationResponse()
          .build(),
      ])
      .withLogin()
      .mount()

    await screen.findByText('Add where you want to receive your order.')

    const deliverySection = await screen.findByRole('region', {
      name: 'Delivery',
    })
    const contactSection = await screen.findByRole('region', { name: 'Phone' })

    expect(deliverySection).not.toHaveAttribute('aria-disabled')
    expect(contactSection).toHaveAttribute('aria-disabled', 'true')

    await fillManualAddressForm(addressFormFill)
    await screen.findByLabelText('Save')
    confirmAddressForm()
    await screen.findByText(
      'Calle Arquitecto Mora, 10, Piso 8 Puerta 14, 46010, València',
    )
    selectFirstAvailableDay()
    selectSlot('From 12:00 to 13:00')
    confirmSlot()

    await screen.findByText('Add a phone number')

    fillPhone('645 78 59 24')
    saveChanges()

    await screen.findByText('+34 645 78 59 24')

    await continueCheckoutWithTokenAuth()
    await authoriseMitTermsModal()

    const dialogAddPaymentMethod = await screen.findByRole('dialog', {
      name: 'Add payment method',
    })
    await selectNewPaymentMethodCard()

    await within(dialogAddPaymentMethod).findByTitle('payment-card-tpv-iframe')

    act(() => confirmTokenAuthnScaChallenge())

    expect(
      screen.getByRole('dialog', { name: 'Confirming your order' }),
    ).toBeInTheDocument()

    const checkoutConfirmed = await screen.findByRole('region', {
      name: 'Order 44051 confirmed',
    })

    expect(checkoutConfirmed).toBeInTheDocument()
  })

  it('should be able to confirm a checkout without slot', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            { responseBody: CheckoutMother.withoutSlot() },
            { responseBody: CheckoutMother.confirmed() },
            { responseBody: CheckoutMother.confirmed() },
          ],
        },
        {
          path: `/customers/1/addresses/${address.id}/slots/`,
          responseBody: slots,
        },
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/delivery-info/',
          requestBody: { address: address, slot: slots.results[0] },
          method: 'put',
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
          path: '/customers/1/addresses/',
          responseBody: { results: [address] },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Delivery')

    selectFirstAvailableDay()
    selectSlot('From 12:00 to 13:00')
    confirmSlot()
    await confirmCheckout()

    expect(
      await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      }),
    ).toBeInTheDocument()
  })

  it('should be redirected to the Not Found page if the user tries to get an already finished checkout', async () => {
    const responses = [
      { path: '/customers/1/checkouts/5/', status: 404 },
      { path: '/customers/1/orders/', responseBody: { results: [] } },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    const notFoundTitle = await screen.findByText(
      'Sorry, it is not possible to find the page you are looking for.',
    )

    expect(notFoundTitle).toBeInTheDocument()
  })

  it('should show the throttling error when receiving too many request from the API', async () => {
    const formattedError = { detail: 'throttled' }
    const responses = [
      {
        path: '/customers/1/checkouts/5/',
        status: 429,
        responseBody: { errors: [formattedError] },
      },
      { path: '/customers/1/orders/', responseBody: { results: [] } },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    const errorModal = await screen.findByRole('dialog')

    expect(errorModal).toHaveTextContent(formattedError.detail)
  })

  it('should display the alert after close the tab', async () => {
    const responses = [
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.filled(),
      },
      { path: '/customers/1/orders/', responseBody: { results: [] } },
    ]
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')
    closeTab()

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'system_dismiss_checkout_alert_view',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'system_dismiss_checkout_alert_confirm_click',
    )
  })

  it('should redirect to the confirmation page when the checkout is already confirmed', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/cart/', responseBody: expensiveCart },
        {
          path: '/customers/1/checkouts/5/',
          multipleResponses: [
            { responseBody: CheckoutMother.filled() },
            { responseBody: CheckoutMother.confirmed() },
            { responseBody: CheckoutMother.confirmed() },
            { responseBody: CheckoutMother.confirmed() },
          ],
        },
        { path: '/customers/1/orders/', responseBody: { results: [] } },
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

    await screen.findByRole('button', { name: /confirm order/i })
    await confirmCheckout()
    await screen.findByRole('region', {
      name: 'Order 44051 confirmed',
    })
    history.goBack()

    expect(
      await screen.findByRole('region', {
        name: 'Order 44051 confirmed',
      }),
    ).toBeInTheDocument()
  })

  it('displays the support widget on the checkout page', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('button', { name: 'Confirm order' })
    expect(Support.showButton).toHaveBeenCalledWith('/checkout/5')
    expect(Support.hideButton).not.toHaveBeenCalled()
  })

  it('should be able to reconfirm a checkout with an uncontrolled error', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        {
          path: '/customers/1/checkouts/5/orders/',
          method: 'post',
          status: 400,
          responseBody: {
            errors: [
              { code: 'uncontrolled_error', detail: 'Uncontrolled error' },
            ],
          },
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { name: 'Checkout', level: 1 })

    const confirmButton = screen.getByRole('button', { name: 'Confirm order' })

    expect(confirmButton).toBeEnabled()

    await confirmCheckout()
    expect(confirmButton).toBeDisabled()

    await waitFor(() => {
      expect(confirmButton).toBeEnabled()
    })
  })
})
