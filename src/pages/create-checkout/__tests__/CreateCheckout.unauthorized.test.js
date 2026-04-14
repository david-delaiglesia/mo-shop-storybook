import { screen } from '@testing-library/react'

import {
  acceptPolicyTerms,
  confirmEmail,
  confirmPassword,
  confirmSignUp,
  fillEmailInput,
  fillNameInput,
  fillPasswordInput,
  fillSurnameInput,
  goBack,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  expensiveCart,
  expensiveCartRequest,
  localCart,
  validatedLocalCart,
} from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { CheckoutMother } from 'app/checkout/__scenarios__/CheckoutMother'
import { user } from 'app/user/__scenarios__/user'
import { loadRecaptchaScript } from 'pages/authenticate-user/__tests__/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Create checkout - Unauthorized', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const uuid = '1'

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should display the checkout page after login through the create checkout process', async () => {
    Storage.setItem('cart', localCart)
    const readyMock = vi.fn((cb) => cb())
    const executeMock = vi.fn().mockResolvedValue('recaptcha_token')
    window.grecaptcha = {
      enterprise: {
        ready: readyMock,
        execute: executeMock,
      },
    }
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
          recaptcha_token: 'recaptcha_token',
        },
        responseBody: {
          access_token: '1234',
          customer_id: '1',
        },
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
    loadRecaptchaScript()
    fillEmailInput('johndoe@gmail.com')
    confirmEmail()
    await screen.findByText('Enter your password to continue with your order.')
    fillPasswordInput('password')
    confirmPassword()
    await screen.findByText('Delivery')

    expect(`/customers/${uuid}/cart/`).toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 1, product_id: '28757', sources: ['+RO'] }],
      },
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_click', {
      email: 'johndoe@gmail.com',
      source: 'checkout',
    })
  })

  it('should display the create account form when the inserted email does not exist', async () => {
    const responses = [
      {
        path: '/customers/actions/check-email/',
        method: 'post',
        requestBody: { email: 'johndoe@gmail.com' },
        responseBody: { account_exists: false },
      },
    ]
    wrap(App).atPath('/checkout').withNetwork(responses).mount()

    await screen.findByRole('form', { name: 'Login' })

    fillEmailInput('johndoe@gmail.com')
    confirmEmail()

    await screen.findByRole('form', { name: 'Create account' })

    expect(
      screen.getByText('Log in to enjoy the online purchasing of Mercadona.'),
    ).toBeInTheDocument()
    expect(screen.getByText(/By continuing, you accept/)).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Surname(s)')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByLabelText('Continue')).toBeInTheDocument()
    expect(screen.getByLabelText('Continue')).toBeDisabled()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('auth')
  })

  it('should display the checkout page after sign up through the create checkout process', async () => {
    Storage.setItem('cart', expensiveCartRequest.cart)
    const responses = [
      {
        path: '/customers/actions/check-email/',
        method: 'post',
        requestBody: { email: 'johndoe@gmail.com' },
        responseBody: { account_exists: false },
      },
      {
        path: '/customers/actions/create_and_authenticate/',
        method: 'post',
        requestBody: {
          name: 'john',
          last_name: 'doe',
          email: 'johndoe@gmail.com',
          password: 'password',
          current_postal_code: '46010',
        },
        responseBody: {
          auth: {
            access_token: '1234',
            customer_id: '1',
          },
          customer: user,
        },
      },
      {
        path: `/carts/`,
        method: 'post',
        requestBody: expensiveCartRequest.cart,
        responseBody: expensiveCart,
      },
      {
        path: `/customers/${uuid}/cart/`,
        method: 'put',
        requestBody: expensiveCartRequest.cart,
        responseBody: expensiveCart,
      },
      {
        path: `/customers/${uuid}/checkouts/`,
        method: 'post',
        requestBody: { ...expensiveCartRequest },
        responseBody: CheckoutMother.default(),
      },
      {
        path: `/customers/${uuid}/orders/`,
        responseBody: { results: [] },
      },
      {
        path: '/customers/1/checkouts/5/',
        responseBody: CheckoutMother.default(),
      },
    ]
    wrap(App).atPath('/checkout').withNetwork(responses).mount()

    await screen.findByRole('form', { name: 'Login' })

    fillEmailInput('johndoe@gmail.com')
    confirmEmail()

    await screen.findByRole('form', { name: 'Create account' })

    fillNameInput('john')
    fillSurnameInput('doe')
    fillPasswordInput('password')

    const continueButton = screen.getByRole('button', { name: 'Continue' })
    expect(continueButton).toBeDisabled()

    acceptPolicyTerms()
    confirmSignUp()

    const deliveryTitle = await screen.findByText('Delivery')

    expect(deliveryTitle).toBeInTheDocument()
  })

  it('should display the login form when the inserted email exists', async () => {
    const responses = [
      {
        path: '/customers/actions/check-email/',
        method: 'post',
        requestBody: { email: 'johndoe@gmail.com' },
        responseBody: { account_exists: true },
      },
    ]
    wrap(App).atPath('/checkout').withNetwork(responses).mount()

    await screen.findByRole('form', { name: 'Login' })

    fillEmailInput('johndoe@gmail.com')
    confirmEmail()

    await screen.findByRole('form', { name: 'Hello again' })

    expect(
      screen.getByText('Enter your password to continue with your order.'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByText('Forgot password?')).toBeInTheDocument()
    expect(screen.getByText('Continue')).toBeInTheDocument()
  })

  it('should display the password error when the login fails', async () => {
    const readyMock = vi.fn((cb) => cb())
    const executeMock = vi.fn().mockResolvedValue('recaptcha_token')
    window.grecaptcha = {
      enterprise: {
        ready: readyMock,
        execute: executeMock,
      },
    }

    const responses = [
      {
        path: '/customers/actions/check-email/',
        method: 'post',
        requestBody: { email: 'johndoe@gmail.com' },
        responseBody: { account_exists: true },
      },
      {
        path: '/auth/tokens/?lang=es&wh=vlc1',
        method: 'post',
        requestBody: {
          username: 'johndoe@gmail.com',
          password: 'password',
          recaptcha_token: 'recaptcha_token',
        },
        responseBody: { errors: [] },
        status: 400,
      },
    ]
    wrap(App).atPath('/checkout').withNetwork(responses).mount()

    await screen.findByRole('form', { name: 'Login' })
    loadRecaptchaScript()
    fillEmailInput('johndoe@gmail.com')
    confirmEmail()
    await screen.findByRole('form', { name: 'Hello again' })
    fillPasswordInput('password')
    confirmPassword()
    const errorMessage = await screen.findByText('The password is not valid.')

    expect(errorMessage).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_click', {
      email: 'johndoe@gmail.com',
      source: 'checkout',
    })
  })

  it('should go back to home', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/checkout').withNetwork(responses).mount()

    await screen.findByRole('form', { name: 'Login' })
    goBack()
    await screen.findByText('Novedades')

    expect(screen.getByText('Novedades')).toBeInTheDocument()
  })
})
