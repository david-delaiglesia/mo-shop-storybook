import { screen } from '@testing-library/react'

import {
  closeLogin,
  confirmForm,
  continueWithRecoveredPassword,
  doLogin,
  fillEmail,
  fillPassword,
  goBackFromLogin,
  loadRecaptchaScript,
  recoverPassword,
  submitLoginForm,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cart,
  emptyCart,
  emptyLocalCart,
  localCart,
  validatedLocalCart,
} from 'app/cart/__scenarios__/cart'
import {
  homeWithGrid,
  homeWithRecommendations,
} from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { user } from 'app/user/__scenarios__/user'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Authenticate - Login', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const uuid = '1'
  const email = 'johndoe@gmail.com'
  const password = 'my_password'

  beforeEach(() => {
    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    const readyMock = vi.fn((cb) => cb())
    const executeMock = vi.fn().mockResolvedValue('recaptcha_token')
    window.grecaptcha = {
      enterprise: {
        ready: readyMock,
        execute: executeMock,
      },
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it("should not show login when query params aren't on url", async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()
    await screen.findByText('Novedades')
    const loginModal = screen.queryByRole('dialog')

    expect(loginModal).not.toBeInTheDocument()
  })

  it('should show login step to existing users', async () => {
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        method: 'post',
        path: '/customers/actions/check-email/',
        requestBody: { email },
        responseBody: { account_exists: true },
        status: 200,
      },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findByText('Sign in', { selector: 'h1' })
    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')

    expect(screen.getByText('Hello again')).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('auth')
  })

  it('should go back to add email', async () => {
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        method: 'post',
        path: '/customers/actions/check-email/',
        requestBody: { email },
        responseBody: { account_exists: true },
        status: 200,
      },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findByText('Sign in', { selector: 'h1' })
    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    goBackFromLogin()

    expect(screen.getByText('Sign in', { selector: 'h1' })).toBeInTheDocument()
  })

  it('should close login modal when clicking cancel', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()
    const loginModal = await screen.findByRole('dialog')
    closeLogin()

    expect(loginModal).not.toBeInTheDocument()
  })

  it('should allow login', async () => {
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

    await screen.findByText('Sign in', { selector: 'h1' })

    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await screen.findAllByText('Recomendado para ti')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_click', {
      email: 'johndoe@gmail.com',
      source: 'profile',
    })
    expect(Tracker.setUserProperties).toHaveBeenCalledWith({
      email: 'johndoe@gmail.com',
    })
    expect(Tracker.identifyExistingUser).toHaveBeenCalledWith('1')
    expect(`/customers/${uuid}/cart/`).toHaveBeenFetchedWith({
      method: 'PUT',
      body: { id: '5529dc8b-0a94-4ae0-8145-de5186b542c6', lines: [] },
    })
  })

  it('should warn if incorrect login', async () => {
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
          password: 'incorrect',
          recaptcha_token: 'recaptcha_token',
        },
        responseBody: { errors: [] },
        status: 400,
      },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findByText('Sign in', { selector: 'h1' })
    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword('incorrect')
    submitLoginForm()
    const errorMessage = await screen.findByText('The password is not valid.')

    expect(errorMessage).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_click', {
      email: 'johndoe@gmail.com',
      source: 'profile',
    })
  })

  it('should allow to recover the password', async () => {
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        method: 'post',
        path: '/customers/actions/check-email/',
        requestBody: { email },
        responseBody: { account_exists: true },
      },
      {
        path: '/customers/actions/recover-password/',
        method: 'post',
        requestBody: { email: 'johndoe@gmail.com' },
        status: 204,
      },
    ]
    wrap(App).atPath('/?authenticate-user').withNetwork(responses).mount()

    await screen.findByText('Sign in', { selector: 'h1' })
    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    recoverPassword()
    await screen.findByText('Reset password')

    expect(
      screen.getByText(
        'We have sent to johndoe@gmail.com an email with the instructions to reset your password.',
      ),
    ).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'forgot_password_click',
      { auth_email: 'johndoe@gmail.com' },
    )

    continueWithRecoveredPassword()

    expect(screen.getByText('Hello again')).toBeInTheDocument()
  })

  it('should keep the local cart after login', async () => {
    Storage.setItem('cart', localCart)
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/carts/',
        method: 'post',
        requestBody: localCart,
        responseBody: validatedLocalCart,
      },
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
      {
        path: `/customers/${uuid}/cart/`,
        method: 'put',
        requestBody: localCart,
      },
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

    expect(screen.getByLabelText('Show cart')).toHaveTextContent(1)
    expect(screen.getByLabelText('Show cart')).toHaveTextContent('0,85 €')
  })

  it('should keep the remote cart after login if the local cart is empty', async () => {
    Storage.setItem('cart', emptyLocalCart)
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
      { path: `/customers/${uuid}/cart/`, responseBody: cart },
      {
        path: `/customers/${uuid}/cart/`,
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            {
              product_id: '8731',
              quantity: 2,
              sources: [],
            },
          ],
        },
      },
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

    expect(screen.getByLabelText('Show cart')).toHaveTextContent(2)
    expect(screen.getByLabelText('Show cart')).toHaveTextContent('1,70 €')
  })
})
