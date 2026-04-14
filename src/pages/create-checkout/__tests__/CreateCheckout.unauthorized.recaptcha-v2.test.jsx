import { screen } from '@testing-library/react'

import {
  confirmEmail,
  confirmPassword,
  fillEmailInput,
  fillPasswordInput,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { localCart, validatedLocalCart } from 'app/cart/__scenarios__/cart'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { user } from 'app/user/__scenarios__/user'
import { knownFeatureFlags } from 'services/feature-flags'
import { Storage } from 'services/storage'

vi.mock('services/recaptcha', () => ({
  Recaptcha: {
    init: vi.fn(),
    getLoginToken: () => Promise.resolve('recaptcha_v3_token'),
    cleanup: vi.fn(),
  },
}))

vi.mock('react-google-recaptcha', async () => {
  const React = await vi.importActual('react')
  const RecaptchaMock = React.forwardRef((props, ref) => {
    if (ref.current) {
      ref.current.executeAsync = () => Promise.resolve('recaptcha_v2_token')
      ref.current.reset = vi.fn()
    }
    return <div data-testid="recaptcha-v2" ref={ref} />
  })
  RecaptchaMock.displayName = 'RecaptchaMock'

  return {
    __esModule: true,
    default: RecaptchaMock,
  }
})

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Create checkout - Unauthorized', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const uuid = '1'
  const email = 'johndoe@gmail.com'
  const password = 'password'

  afterEach(() => {
    vi.restoreAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should login in the checkout using the reCAPTCHA V2 token when V3 failed', async () => {
    activeFeatureFlags([knownFeatureFlags.RECAPTCHA_V2_FALLBACK])

    Storage.setItem('cart', localCart)
    const responses = [
      {
        path: '/carts/',
        method: 'post',
        requestBody: localCart,
        responseBody: validatedLocalCart,
      },
      {
        path: '/customers/actions/check-email/',
        method: 'post',
        requestBody: { email: 'johndoe@gmail.com' },
        responseBody: { account_exists: true },
      },
      {
        path: '/auth/tokens/',
        method: 'post',
        requestBody: {
          username: 'johndoe@gmail.com',
          password: 'password',
          recaptcha_token: 'recaptcha_v3_token',
        },
        status: 412,
        responseBody: {
          code: 'recaptcha_required',
          detail: 'Recaptcha validation required.',
        },
      },
      {
        path: '/auth/tokens/',
        method: 'post',
        requestBody: {
          username: 'johndoe@gmail.com',
          password: 'password',
          recaptcha_token: 'recaptcha_v3_token',
          recaptcha_token_fallback: 'recaptcha_v2_token',
        },
        responseBody: { access_token: '', customer_id: uuid },
      },
      {
        path: `/customers/${uuid}/`,
        responseBody: user,
      },
      {
        path: `/customers/${uuid}/checkouts/`,
        method: 'post',
        requestBody: { cart: localCart },
        responseBody: CheckoutMother.default(),
      },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.default(),
      },
    ]
    wrap(App).atPath('/checkout').withNetwork(responses).mount()

    await screen.findByText('To continue with the order, please log in.')
    fillEmailInput('johndoe@gmail.com')
    confirmEmail()
    await screen.findByText('Enter your password to continue with your order.')
    fillPasswordInput('password')
    confirmPassword()
    await screen.findByText('Delivery')

    expect('/auth/tokens/').toHaveBeenFetchedTimes(2)
    expect('/auth/tokens/').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        username: email,
        password: password,
        recaptcha_token: 'recaptcha_v3_token',
        recaptcha_token_fallback: 'recaptcha_v2_token',
      },
    })
  })

  it('should dont render reCAPTCHA V2 if flag is not active', async () => {
    const responses = [
      {
        path: '/customers/actions/check-email/',
        method: 'post',
        requestBody: { email: 'johndoe@gmail.com' },
        responseBody: { account_exists: true },
      },
    ]
    wrap(App).atPath('/checkout').withNetwork(responses).mount()

    await screen.findByText('To continue with the order, please log in.')
    fillEmailInput('johndoe@gmail.com')
    confirmEmail()
    await screen.findByText('Enter your password to continue with your order.')

    expect(screen.queryByTestId('recaptcha-v2')).not.toBeInTheDocument()
  })
})
