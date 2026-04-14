import { screen, waitFor, within } from '@testing-library/react'

import {
  authorizeMIT,
  closeCheckoutAuthModal,
  confirmCheckout,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { checkoutWithSCA } from 'app/checkout/__scenarios__/checkout'
import {
  paymentAuthenticationRequired,
  redsysPsd2Parameters,
} from 'app/payment/__scenarios__/payments'
import { Storage } from 'services/storage'
import { Support } from 'services/support'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Checkout - MIT', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const responses = [
    { path: '/customers/1/checkouts/5/', responseBody: checkoutWithSCA },
    { path: '/customers/1/orders/', responseBody: { results: [] } },
    {
      path: '/customers/1/checkouts/5/orders/',
      method: 'post',
      status: 419,
      responseBody: paymentAuthenticationRequired,
    },
    {
      path: '/customers/1/payment-cards/auth/sca_id/',
      responseBody: redsysPsd2Parameters,
    },
  ]

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('displays the MIT terms modal when the user confirms a >250EUR checkout', async () => {
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    const summarySection = await screen.findByRole('region', {
      name: /summary/i,
    })
    const authorisePaymentButton = within(summarySection).getByRole('button', {
      name: /confirm order/i,
    })
    confirmCheckout()
    const paymentMethodModal = await screen.findByRole('dialog')

    expect(
      within(authorisePaymentButton).getByLabelText(/loading/i),
    ).toBeInTheDocument()
    expect(paymentMethodModal).toHaveTextContent('Authorisation required')
    expect(paymentMethodModal).toHaveTextContent('We need you to authorise')
    expect(within(paymentMethodModal).getByRole('mark')).toHaveTextContent(
      'Authorise the payment with your bank and return to the app to complete the purchase.',
    )
    expect(
      within(paymentMethodModal).getByRole('button', { name: /authorise/i }),
    ).toBeInTheDocument()
    expect(
      within(paymentMethodModal).getByRole('button', { name: /back/i }),
    ).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('mit_term', {
      flow: 'checkout',
    })
  })

  it('allows to close the MIT terms modal', async () => {
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    const summarySection = await screen.findByRole('region', {
      name: /summary/i,
    })
    const authorisePaymentButton = within(summarySection).getByRole('button', {
      name: /confirm order/i,
    })
    confirmCheckout()
    await screen.findByRole('dialog')

    expect(
      within(authorisePaymentButton).getByLabelText(/loading/i),
    ).toBeInTheDocument()

    closeCheckoutAuthModal()

    expect(
      within(authorisePaymentButton).queryByLabelText(/loading/i),
    ).not.toBeInTheDocument()

    expect(Support.showButton).toHaveBeenCalledWith('/checkout/5')
    expect(Support.hideButton).not.toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('loader')).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'mit_term_cancel_button_click',
    )
  })

  it('should start the authentication challenge', async () => {
    wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()

    await screen.findByText('Delivery')
    confirmCheckout()
    await screen.findByRole('dialog')
    authorizeMIT()
    const iframeChallenge = await screen.findByTestId('sca-form')

    expect(iframeChallenge).toBeInTheDocument()
  })

  it('should accept the MIT term', async () => {
    const mountApp = (responses) =>
      wrap(App).atPath('/checkout/5').withNetwork(responses).withLogin().mount()
    mountApp(responses)

    await screen.findByText('Delivery')
    confirmCheckout()
    await screen.findByRole('dialog')
    authorizeMIT()
    await screen.findByTestId('sca-form')

    await waitFor(() => {
      expect(Tracker.sendInteraction).toHaveBeenCalledWith(
        'mit_term_accept_button_click',
      )
    })
  })
})
