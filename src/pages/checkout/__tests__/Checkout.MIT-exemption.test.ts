import { screen, waitFor, within } from '@testing-library/react'

import { authoriseMitTermsModal } from './helpers'
import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { PaymentTPV } from 'app/payment'
import { PaymentAuthenticationMother } from 'app/payment/__scenarios__/PaymentAuthenticationMother'
import { confirmCheckout } from 'pages/__tests__/helpers/checkout'
import { knownFeatureFlags } from 'services/feature-flags'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

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

const confirmWithMIT = {
  path: '/customers/1/checkouts/5/confirm/',
  method: 'post' as const,
  status: 202,
  responseBody: {
    authentication_mode: 'redirection',
    authentication_uuid: 'checkout_authentication_uuid',
    exemption: 'MIT',
  },
}

const authenticationEndpoint = {
  path: `/customers/1/checkouts/5/authentication/?${new URLSearchParams({
    lang: 'en',
    wh: 'vlc1',
    authentication_uuid: 'checkout_authentication_uuid',
    ok_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_OK_URL}`,
    ko_url: `http://localhost:3000/checkout/5?${CHECKOUT_TPV_KO_URL}`,
  })}`,
  catchParams: true,
  responseBody: PaymentAuthenticationMother.redsysCard(),
}

describe('Checkout - MIT exemption', () => {
  configure({
    changeRoute: history.push,
  })

  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.CHECKOUT_NEW_CONFIRM_STRATEGY])
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should show MIT terms modal when confirm responds with exemption MIT', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        confirmWithMIT,
      ])
      .withLogin()
      .mount()

    await confirmCheckout()

    expect(
      await screen.findByRole('dialog', { name: 'Authorisation required' }),
    ).toBeInTheDocument()
  })

  it('should close MIT terms modal and stop loading when user cancels', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        confirmWithMIT,
      ])
      .withLogin()
      .mount()

    const confirmButton = await screen.findByRole('button', {
      name: 'Confirm order',
    })
    await confirmCheckout()
    await screen.findByRole('dialog', { name: 'Authorisation required' })

    expect(within(confirmButton).getByLabelText('Loading')).toBeInTheDocument()

    const mitModal = screen.getByRole('dialog', {
      name: 'Authorisation required',
    })
    userEvent.click(within(mitModal).getByRole('button', { name: 'Back' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(
      within(confirmButton).queryByLabelText('Loading'),
    ).not.toBeInTheDocument()
  })

  it('should send start_psd2_flow with is_MIT true when exemption is MIT', async () => {
    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        confirmWithMIT,
        authenticationEndpoint,
      ])
      .withLogin()
      .mount()

    await confirmCheckout()
    await screen.findByRole('dialog', { name: 'Authorisation required' })
    authoriseMitTermsModal()

    await waitFor(() => {
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('start_psd2_flow', {
        payment_method_type: 'card',
        type: 'authentication',
        provider: 'redsys',
        payment_authentication_uuid: 'checkout_authentication_uuid',
        user_flow: 'checkout',
        is_MIT: true,
      })
    })
  })

  it('should redirect to TPV when user accepts MIT terms modal', async () => {
    vi.spyOn(PaymentTPV, 'autoRedirectToPaymentAuth')

    wrap(App)
      .atPath('/checkout/5')
      .withNetwork([
        {
          path: '/customers/1/checkouts/5/',
          responseBody: CheckoutMother.filled(),
        },
        confirmWithMIT,
        authenticationEndpoint,
      ])
      .withLogin()
      .mount()

    await confirmCheckout()
    await screen.findByRole('dialog', { name: 'Authorisation required' })
    authoriseMitTermsModal()

    await waitFor(() => {
      expect(
        PaymentTPV.autoRedirectToPaymentAuth,
      ).toHaveBeenCalledExactlyOnceWith(
        PaymentAuthenticationMother.redsysCard().params,
      )
    })
  })
})
