import { screen, waitFor } from '@testing-library/react'

import { confirmForm, doLogin, fillEmail, fillPassword } from './helpers'
import { monitoring } from 'monitoring'
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
import { Session } from 'services/session'
import { Storage } from 'services/storage'

vi.mock('services/recaptcha', () => ({
  Recaptcha: {
    init: vi.fn(),
    getLoginToken: () => Promise.reject(new Error('library failed')),
    cleanup: vi.fn(),
  },
}))

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Authenticate - Login monitoring', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  const uuid = '1'
  const email = 'johndoe@gmail.com'
  const password = 'my_password'

  beforeEach(() => {
    activeFeatureFlags([knownFeatureFlags.LOGIN_MONITORING])
  })

  afterEach(() => {
    vi.restoreAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should send login_error_credentials when login returns 400', async () => {
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
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
          requestBody: { username: email, password },
          status: 400,
          responseBody: { errors: [] },
        },
      ])
      .mount()

    await screen.findByRole('dialog')
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await screen.findByText('The password is not valid.')

    expect(monitoring.sendMessage).toHaveBeenCalledWith(
      'login_error_credentials',
    )
  })

  it('should send login_error_recaptcha_required when login returns 412', async () => {
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
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
          requestBody: { username: email, password },
          status: 412,
          responseBody: {
            errors: [{ detail: 'Recaptcha validation required.' }],
          },
        },
      ])
      .mount()

    await screen.findByRole('dialog')
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await waitFor(() => {
      expect(monitoring.sendMessage).toHaveBeenCalledWith(
        'login_error_recaptcha_required',
        { has_v2_fallback_active: false },
      )
    })
  })

  it('should send login_error_session_save when Session.saveUser throws', async () => {
    vi.spyOn(Session, 'saveUser').mockImplementation(() => {
      throw new Error('storage full')
    })

    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
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
          requestBody: { username: email, password },
          responseBody: { access_token: '', customer_id: uuid },
        },
      ])
      .mount()

    await screen.findByRole('dialog')
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await waitFor(() => {
      expect(monitoring.sendMessage).toHaveBeenCalledWith(
        'login_error_session_save',
        {
          reason: 'Error: storage full',
        },
      )
    })
  })

  it('should send login_error_get_user_data when getUserData fails after successful login', async () => {
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
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
          requestBody: { username: email, password },
          responseBody: { access_token: '', customer_id: uuid },
        },
        {
          path: `/customers/${uuid}/`,
          status: 503,
          responseBody: {},
        },
      ])
      .mount()

    await screen.findByRole('dialog')
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await waitFor(() => {
      expect(monitoring.sendMessage).toHaveBeenCalledWith(
        'login_error_get_user_data',
        {
          status: 503,
          reason: expect.any(String),
        },
      )
    })
  })

  it('should send login_error_unexpected when login returns a non-400 error', async () => {
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
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
          requestBody: { username: email, password },
          status: 500,
          responseBody: {},
        },
      ])
      .mount()

    await screen.findByRole('dialog')
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await waitFor(() => {
      expect(monitoring.sendMessage).toHaveBeenCalledWith(
        'login_error_unexpected',
        {
          status: 500,
          reason: expect.any(String),
        },
      )
    })
  })

  it('should send login_error_recaptcha_library when Recaptcha.getLoginToken throws', async () => {
    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
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
          requestBody: { username: email, password },
          responseBody: { access_token: '', customer_id: uuid },
        },
        { path: `/customers/${uuid}/`, responseBody: user },
        {
          path: `/customers/${uuid}/home/`,
          responseBody: homeWithRecommendations,
        },
        { path: `/customers/${uuid}/cart/`, responseBody: emptyCart },
      ])
      .mount()

    await screen.findByRole('dialog')
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await screen.findAllByText('Recomendado para ti')

    expect(monitoring.sendMessage).toHaveBeenCalledWith(
      'login_error_recaptcha_library',
      {
        reason: 'Error: library failed',
      },
    )
  })

  it('should not send login monitoring events when login monitoring flag is not active', async () => {
    activeFeatureFlags([])

    wrap(App)
      .atPath('/?authenticate-user')
      .withNetwork([
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
          requestBody: { username: email, password },
          status: 400,
          responseBody: { errors: [] },
        },
      ])
      .mount()

    await screen.findByRole('dialog')
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await screen.findByText('The password is not valid.')

    expect(monitoring.sendMessage).not.toHaveBeenCalledWith(
      'login_error_credentials',
    )
  })
})
