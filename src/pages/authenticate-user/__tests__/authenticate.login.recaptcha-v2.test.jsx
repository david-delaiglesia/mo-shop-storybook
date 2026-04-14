import { screen } from '@testing-library/react'

import { confirmForm, doLogin, fillEmail, fillPassword } from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { emptyCart } from 'app/cart/__scenarios__/cart'
import {
  homeWithGrid,
  homeWithRecommendations,
} from 'app/catalog/__scenarios__/home'
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

describe('Authenticate - Login with reCAPTCHA', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const uuid = '1'
  const email = 'johndoe@gmail.com'
  const password = 'my_password'

  afterEach(() => {
    vi.restoreAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should login using the reCAPTCHA V2 token when V3 failed', async () => {
    activeFeatureFlags([knownFeatureFlags.RECAPTCHA_V2_FALLBACK])

    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        method: 'post',
        path: '/customers/actions/check-email/',
        requestBody: { email },
        responseBody: { account_exists: true },
      },
      {
        method: 'post',
        path: '/auth/tokens/',
        requestBody: {
          username: email,
          password: password,
          recaptcha_token: 'recaptcha_v3_token',
        },
        status: 412,
        responseBody: {
          code: 'recaptcha_required',
          detail: 'Recaptcha validation required.',
        },
      },
      {
        method: 'post',
        path: '/auth/tokens/',
        requestBody: {
          username: email,
          password: password,
          recaptcha_token: 'recaptcha_v3_token',
          recaptcha_token_fallback: 'recaptcha_v2_token',
        },
        responseBody: { access_token: '', customer_id: uuid },
      },
      { path: `/customers/${uuid}/`, responseBody: user },
      {
        path: `/customers/${uuid}/home/`,
        responseBody: homeWithRecommendations,
      },
      { path: `/customers/${uuid}/cart/`, responseBody: emptyCart },
      {
        path: `/customers/${uuid}/cart/`,
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [],
        },
        responseBody: emptyCart,
      },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findByRole('dialog')
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await screen.findByRole('button', { name: 'Hello John' })

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
      { path: '/home/', responseBody: homeWithGrid },
      {
        method: 'post',
        path: '/customers/actions/check-email/',
        requestBody: { email },
        responseBody: { account_exists: true },
      },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findByRole('dialog')
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')

    expect(screen.queryByTestId('recaptcha-v2')).not.toBeInTheDocument()
  })
})
