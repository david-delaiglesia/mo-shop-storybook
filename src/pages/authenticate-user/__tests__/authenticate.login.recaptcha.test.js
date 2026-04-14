import { screen } from '@testing-library/react'

import {
  confirmForm,
  doLogin,
  fillEmail,
  fillPassword,
  loadRecaptchaScript,
  showMoreRecaptchaInfo,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { emptyCart } from 'app/cart/__scenarios__/cart'
import {
  homeWithGrid,
  homeWithRecommendations,
} from 'app/catalog/__scenarios__/home'
import { user } from 'app/user/__scenarios__/user'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Authenticate - Login with reCAPTCHA', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  window.grecaptcha = {
    enterprise: {
      ready: vi.fn((cb) => cb()),
      execute: vi.fn().mockResolvedValue('recaptcha_token'),
    },
  }

  const uuid = '1'
  const email = 'johndoe@gmail.com'
  const password = 'my_password'

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('sends the reCAPTCHA token to the auth endpoint', async () => {
    const executeMock = vi.fn().mockResolvedValue('recaptcha_token')

    vi.spyOn(window.grecaptcha.enterprise, 'execute').mockImplementation(
      executeMock,
    )

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
          recaptcha_token: 'recaptcha_token',
        },
        responseBody: { access_token: '', customer_id: uuid },
      },
      { path: `/customers/${uuid}/`, responseBody: user },
      {
        path: `/customers/${uuid}/home/`,
        responseBody: homeWithRecommendations,
      },
      { path: `/customers/${uuid}/cart/`, responseBody: emptyCart },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findByRole('heading', { name: 'Sign in', level: 1 })
    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await screen.findAllByText('Recomendado para ti')

    expect(executeMock).toHaveBeenCalledWith(
      import.meta.env.VITE_GOOGLE_RECAPTCHA_KEY,
      { action: 'login' },
    )
    expect('/auth/tokens/').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        username: email,
        password: password,
        recaptcha_token: 'recaptcha_token',
      },
    })
  })

  it('does not send the reCAPTCHA token to the auth endpoint when getting the token fails', async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error('BOOM!'))

    vi.spyOn(window.grecaptcha.enterprise, 'execute').mockImplementation(
      executeMock,
    )

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
        },
        responseBody: { access_token: '', customer_id: uuid },
      },
      { path: `/customers/${uuid}/`, responseBody: user },
      {
        path: `/customers/${uuid}/home/`,
        responseBody: homeWithRecommendations,
      },
      { path: `/customers/${uuid}/cart/`, responseBody: emptyCart },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findByText('Sign in', { selector: 'h1' })
    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await screen.findAllByText('Recomendado para ti')

    expect(executeMock).toHaveBeenCalledWith(
      import.meta.env.VITE_GOOGLE_RECAPTCHA_KEY,
      { action: 'login' },
    )

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'recaptcha_library_error',
      {
        email: 'johndoe@gmail.com',
        error_description: 'Error: BOOM!',
      },
    )
  })

  it('displays the reCAPTCHA terms and conditions', async () => {
    const readyMock = vi.fn((cb) => cb())
    window.grecaptcha = {
      enterprise: {
        ready: readyMock,
      },
    }

    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findByText('Sign in', { selector: 'h1' })
    loadRecaptchaScript()

    expect(
      screen.getByText(
        'The login is protected by Google reCAPTCHA to make the website more secure.',
      ),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'More information.' }),
    ).toBeInTheDocument()

    expect(
      screen.getByText(
        /The information collected by Google reCAPTCHA is subject to/,
      ),
    ).toHaveAttribute('hidden')

    showMoreRecaptchaInfo()

    expect(
      screen.getByText(
        /The information collected by Google reCAPTCHA is subject to/,
      ),
    ).not.toHaveAttribute('hidden')
  })
})
