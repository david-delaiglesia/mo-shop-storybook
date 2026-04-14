import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'

import {
  confirmForm,
  confirmSignUpForm,
  fillEmail,
  fillPassword,
  fillSignUpForm,
  loadRecaptchaScript,
  submitLoginForm,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { HomeSectionMother } from 'app/home/__scenarios__/HomeSectionMother'
import { Recaptcha } from 'services/recaptcha'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

const email = 'johndoe@example.com'

describe('Auth metrics', () => {
  beforeEach(() => {
    const readyMock = vi.fn((cb: () => void) => cb())
    const executeMock = vi.fn().mockResolvedValue('recaptcha_token')
    ;(window as Window & { grecaptcha?: unknown }).grecaptcha = {
      enterprise: { ready: readyMock, execute: executeMock },
    }
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should send auth_continue_click with email when user clicks Continue', async () => {
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
        {
          path: '/home/',
          responseBody: { sections: [HomeSectionMother.gridNews()] },
        },
        {
          method: 'post',
          path: '/customers/actions/check-email/',
          requestBody: { email },
          responseBody: { account_exists: true },
        },
      ])
      .mount()

    await screen.findByRole('heading', { name: 'Sign in', level: 1 })
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'auth_continue_click',
      {
        email,
      },
    )
  })

  it('should send auth_login_view with email when login view is shown', async () => {
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
        {
          path: '/home/',
          responseBody: { sections: [HomeSectionMother.gridNews()] },
        },
        {
          method: 'post',
          path: '/customers/actions/check-email/',
          requestBody: { email },
          responseBody: { account_exists: true },
        },
      ])
      .mount()

    await screen.findByRole('heading', { name: 'Sign in', level: 1 })
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_view', {
      email,
    })
  })

  it('should send auth_login_click with email and source when user submits login', async () => {
    const password = 'any_password'

    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
        {
          path: '/home/',
          responseBody: { sections: [HomeSectionMother.gridNews()] },
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
            password,
            recaptcha_token: 'recaptcha_token',
          },
          responseBody: { errors: [] },
          status: 400,
        },
      ])
      .mount()

    await screen.findByRole('heading', { name: 'Sign in', level: 1 })
    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    submitLoginForm()
    await screen.findByText('The password is not valid.')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_click', {
      email,
      source: 'profile',
    })
  })

  it('should send auth_login_error with wrong_password when login fails with 400', async () => {
    const password = 'wrong_password'

    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
        {
          path: '/home/',
          responseBody: { sections: [HomeSectionMother.gridNews()] },
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
            password,
            recaptcha_token: 'recaptcha_token',
          },
          responseBody: { errors: [] },
          status: 400,
        },
      ])
      .mount()

    await screen.findByRole('heading', { name: 'Sign in', level: 1 })
    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    submitLoginForm()
    await screen.findByText('The password is not valid.')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_error', {
      email,
      error_type: 'wrong_password',
    })
  })

  it('should send auth_login_success with email when login succeeds', async () => {
    const uuid = '1'
    const password = 'correct_password'
    const loggedInUser = {
      id: 1,
      uuid,
      email,
      name: 'John',
      current_postal_code: '46004',
      cart_id: 'cart-1',
      last_name: 'Doe',
    }

    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
        {
          path: '/home/',
          responseBody: { sections: [HomeSectionMother.gridNews()] },
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
            password,
            recaptcha_token: 'recaptcha_token',
          },
          responseBody: { access_token: '', customer_id: uuid },
        },
        { path: `/customers/${uuid}/`, responseBody: loggedInUser },
        {
          path: `/customers/${uuid}/home/`,
          responseBody: { sections: [HomeSectionMother.gridNews()] },
        },
        {
          path: `/customers/${uuid}/cart/`,
          responseBody: { id: 'cart-1', lines: [] },
        },
      ])
      .mount()

    await screen.findByRole('heading', { name: 'Sign in', level: 1 })
    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    submitLoginForm()
    await waitForElementToBeRemoved(() => screen.queryByText('Hello again'))

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_success', {
      email,
    })
  })

  it('should send auth_login_error with recaptcha when recaptcha library fails', async () => {
    const password = 'any_password'

    const getLoginTokenSpy = vi
      .spyOn(Recaptcha, 'getLoginToken')
      .mockRejectedValue(new Error('recaptcha error'))

    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
        {
          path: '/home/',
          responseBody: { sections: [HomeSectionMother.gridNews()] },
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
          requestBody: { username: email, password },
          responseBody: { errors: [] },
          status: 400,
        },
      ])
      .mount()

    await screen.findByRole('heading', { name: 'Sign in', level: 1 })
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    submitLoginForm()
    await screen.findByText('The password is not valid.')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_error', {
      email,
      error_type: 'recaptcha',
    })
    getLoginTokenSpy.mockRestore()
  })

  it('should send auth_login_error with unknown when login fails with a server error', async () => {
    const password = 'any_password'

    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
        {
          path: '/home/',
          responseBody: { sections: [HomeSectionMother.gridNews()] },
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
            password,
            recaptcha_token: 'recaptcha_token',
          },
          responseBody: { errors: [] },
          status: 500,
        },
      ])
      .mount()

    await screen.findByRole('heading', { name: 'Sign in', level: 1 })
    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    submitLoginForm()

    await waitFor(() => {
      expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_error', {
        email,
        error_type: 'unknown',
      })
    })
  })

  it('should send auth_create_account_view with email when sign-up view is shown', async () => {
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
        {
          path: '/home/',
          responseBody: { sections: [HomeSectionMother.gridNews()] },
        },
        {
          method: 'post',
          path: '/customers/actions/check-email/',
          requestBody: { email },
          responseBody: { account_exists: false },
        },
      ])
      .mount()

    await screen.findByRole('heading', { name: 'Sign in', level: 1 })
    fillEmail(email)
    confirmForm()
    await screen.findByText('Create account')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'auth_create_account_view',
      { email },
    )
  })

  it('should send auth_create_account_click with email and source when user submits sign-up', async () => {
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
        {
          path: '/home/',
          responseBody: { sections: [HomeSectionMother.gridNews()] },
        },
        {
          method: 'post',
          path: '/customers/actions/check-email/',
          requestBody: { email },
          responseBody: { account_exists: false },
        },
        {
          method: 'post',
          path: '/customers/actions/create_and_authenticate/',
          requestBody: {
            name: 'John',
            last_name: 'Doe',
            password: 'secure_password',
            email,
            current_postal_code: '46010',
          },
          status: 409,
          responseBody: {},
        },
      ])
      .mount()

    await screen.findByRole('heading', { name: 'Sign in', level: 1 })
    fillEmail(email)
    confirmForm()
    await screen.findByText('Create account')
    fillSignUpForm({
      name: 'John',
      lastname: 'Doe',
      password: 'secure_password',
    })
    confirmSignUpForm()
    await screen.findByRole('dialog', {
      name: 'Operation not completed. Sign up is not available for this email right now. Please contact User Support.',
    })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'auth_create_account_click',
      { email, source: 'profile' },
    )
  })

  it('should send auth_create_account_error with unknown when sign-up fails', async () => {
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
        {
          path: '/home/',
          responseBody: { sections: [HomeSectionMother.gridNews()] },
        },
        {
          method: 'post',
          path: '/customers/actions/check-email/',
          requestBody: { email },
          responseBody: { account_exists: false },
        },
        {
          method: 'post',
          path: '/customers/actions/create_and_authenticate/',
          requestBody: {
            name: 'John',
            last_name: 'Doe',
            password: 'secure_password',
            email,
            current_postal_code: '46010',
          },
          status: 409,
          responseBody: {},
        },
      ])
      .mount()

    await screen.findByRole('heading', { name: 'Sign in', level: 1 })
    fillEmail(email)
    confirmForm()
    await screen.findByText('Create account')
    fillSignUpForm({
      name: 'John',
      lastname: 'Doe',
      password: 'secure_password',
    })
    confirmSignUpForm()
    await screen.findByRole('dialog', {
      name: 'Operation not completed. Sign up is not available for this email right now. Please contact User Support.',
    })

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'auth_create_account_error',
      { email, error_type: 'unknown' },
    )
  })

  it('should send auth_create_account_success with email when sign-up succeeds', async () => {
    const uuid = '48777600-7ebc-4967-a41c-951407d52fb0'
    const signUpUser = {
      auth: { customer_id: uuid, access_token: 'token' },
      customer: {
        id: 1,
        uuid,
        email,
        name: 'John',
        last_name: 'Doe',
        current_postal_code: '46010',
        cart_id: 'cart-id',
      },
    }

    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
        {
          path: '/home/',
          responseBody: { sections: [HomeSectionMother.gridNews()] },
        },
        {
          method: 'post',
          path: '/customers/actions/check-email/',
          requestBody: { email },
          responseBody: { account_exists: false },
        },
        {
          method: 'post',
          path: '/customers/actions/create_and_authenticate/',
          requestBody: {
            name: 'John',
            last_name: 'Doe',
            password: 'secure_password',
            email,
            current_postal_code: '46010',
          },
          responseBody: signUpUser,
        },
        {
          path: `/customers/${uuid}/home/`,
          responseBody: { sections: [HomeSectionMother.gridNews()] },
        },
        {
          path: `/customers/${uuid}/cart/`,
          responseBody: { id: 'cart-id', lines: [] },
        },
      ])
      .mount()

    await screen.findByRole('heading', { name: 'Sign in', level: 1 })
    fillEmail(email)
    confirmForm()
    await screen.findByText('Create account')
    fillSignUpForm({
      name: 'John',
      lastname: 'Doe',
      password: 'secure_password',
    })
    confirmSignUpForm()
    await waitForElementToBeRemoved(() => screen.queryByText('Create account'))

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'auth_create_account_success',
      { email },
    )
  })
})
