import { screen, within } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { slots } from 'app/delivery-area/__scenarios__/slots'
import { PaymentMethodMother } from 'app/payment/__scenarios__/PaymentMethodMother'
import { clickToModifyPaymentMethod } from 'pages/__tests__/helper'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - Summary', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should display the checkout summary with the proper information', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        { path: '/customers/1/orders/' },
      ])
      .withLogin()
      .mount()

    const checkoutSummary = await screen.findByRole('region', {
      name: 'Summary',
    })

    expect(checkoutSummary).toHaveTextContent('Products cost')
    expect(checkoutSummary).toHaveTextContent('68,25 €')
    expect(checkoutSummary).toHaveTextContent('Service cost')
    expect(checkoutSummary).toHaveTextContent('7,21 €')
    expect(checkoutSummary).toHaveTextContent('Estimated cost')
    expect(checkoutSummary).toHaveTextContent('75,46 €')
    expect(checkoutSummary).toHaveTextContent('VAT included')
    expect(checkoutSummary).toHaveTextContent(
      'May vary for products sold by weight',
    )
    expect(checkoutSummary).toHaveTextContent('Confirm order')
    expect(checkoutSummary).toHaveTextContent('our terms and conditions')
    expect(checkoutSummary).toHaveTextContent('the privacy policy.')
  })

  it('displays a hint message when all the sections are filled properly', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        { path: '/customers/1/orders/' },
      ])
      .withLogin()
      .mount()

    const checkoutSummary = await screen.findByRole('region', {
      name: 'Summary',
    })
    const confirmButton = within(checkoutSummary).getByRole('button', {
      name: 'Confirm order',
    })
    expect(confirmButton).not.toBeDisabled()
    expect(screen.getByRole('mark')).toHaveTextContent(
      'Once you have finalised your order, you will be able to modify it up until 21:00h on 9 November',
    )
  })

  it('does not display a hint message when the checkout is not complete', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.default(),
        },
        { path: '/customers/1/orders/' },
        { path: '/customers/1/addresses/1/slots/', responseBody: slots },
      ])
      .withLogin()
      .mount()

    const checkoutSummary = await screen.findByRole('region', {
      name: 'Summary',
    })
    const confirmButton = within(checkoutSummary).getByRole('button', {
      name: 'Confirm order',
    })

    expect(confirmButton).toBeDisabled()
    expect(screen.queryByRole('log')).not.toBeInTheDocument()
  })

  it('should not allow to finish the checkout if it has not slot', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.default(),
        },
        { path: '/customers/1/orders/' },
        { path: '/customers/1/addresses/1/slots/', responseBody: slots },
      ])
      .withLogin()
      .mount()

    const checkoutSummary = await screen.findByRole('region', {
      name: 'Summary',
    })
    const confirmButton = within(checkoutSummary).getByRole('button', {
      name: 'Confirm order',
    })

    expect(confirmButton).toBeDisabled()
  })

  it('does not display a hint message when the checkout is not complete and the user do not have a payment method', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.empty(),
        },
        { path: '/customers/1/orders/' },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('region', {
      name: 'Summary',
    })

    expect(screen.queryByRole('log')).not.toBeInTheDocument()
  })

  it('should not allow to finish the checkout if it has not address', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutDeliveryInfo(),
        },
        { path: '/customers/1/orders/' },
      ])
      .withLogin()
      .mount()

    const checkoutSummary = await screen.findByRole('region', {
      name: 'Summary',
    })
    const confirmButton = within(checkoutSummary).getByRole('button', {
      name: 'Confirm order',
    })

    expect(confirmButton).toBeDisabled()
  })

  it('should not allow to finish the checkout if payment section is being edited', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
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
      ])
      .withLogin()
      .mount()

    const checkoutSummary = await screen.findByRole('region', {
      name: 'Summary',
    })
    const confirmButton = within(checkoutSummary).getByRole('button', {
      name: 'Confirm order',
    })

    expect(confirmButton).not.toBeDisabled()

    await clickToModifyPaymentMethod()
    const savedPaymentMethodsTitle = await screen.findByText(
      'Saved payment methods',
    )

    expect(savedPaymentMethodsTitle).toHaveFocus()
    expect(confirmButton).toBeDisabled()
  })

  it('should not allow to finish the checkout if it has not contact info', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withoutContactInfo(),
        },
        { path: '/customers/1/orders/' },
      ])
      .withLogin()
      .mount()

    const checkoutSummary = await screen.findByRole('region', {
      name: 'Summary',
    })
    const confirmButton = within(checkoutSummary).getByRole('button', {
      name: 'Confirm order',
    })

    expect(confirmButton).toBeDisabled()
  })

  it('should show bonus delivery subtitle', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withFreeSlot(),
        },
        { path: '/customers/1/orders/' },
      ])
      .withLogin()
      .mount()

    const checkoutSummary = await screen.findByRole('region', {
      name: 'Summary',
    })
    const deliverySubtitle = within(checkoutSummary).getByText(
      'Free preparation as compensation for your last order.',
    )

    expect(deliverySubtitle).toBeInTheDocument()
  })

  it('should show crossed slot bonus text', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withFreeSlot(),
        },
        { path: '/customers/1/orders/' },
      ])
      .withLogin()
      .mount()

    const checkoutSummary = await screen.findByRole('region', {
      name: 'Summary',
    })
    const slotBonus = within(checkoutSummary).getByText('7,21 €')

    expect(slotBonus).toHaveClass('free-delivery__subtotals-bonus')
  })

  it('should show ipsi text when tax type is ipsi', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withIpsi(),
        },
        { path: '/customers/1/orders/' },
      ])
      .withLogin()
      .mount()

    const checkoutSummary = await screen.findByRole('region', {
      name: 'Summary',
    })

    const subtitle = within(checkoutSummary).getByText(
      'May vary for products sold by weight',
    )
    const ipsi = within(checkoutSummary).getByText('IPSI included')

    expect(ipsi).toBeInTheDocument()
    expect(subtitle).toBeInTheDocument()
  })

  it('should show igic text when tax type is igic', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        { path: '/customers/1/orders/', responseBody: { results: [] } },
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.withIgic(),
        },
        { path: '/customers/1/orders/' },
      ])
      .withLogin()
      .mount()

    const checkoutSummary = await screen.findByRole('region', {
      name: 'Summary',
    })

    const subtitle = within(checkoutSummary).getByText(
      'May vary for products sold by weight',
    )
    const igic = within(checkoutSummary).getByText('IGIC included')

    expect(igic).toBeInTheDocument()
    expect(subtitle).toBeInTheDocument()
  })
})
