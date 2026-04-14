import { screen } from '@testing-library/react'

import { openSignIn } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { emptyCart } from 'app/cart/__scenarios__/cart'
import { recommendations } from 'app/catalog/__scenarios__/recommendations'
import { user } from 'app/user/__scenarios__/user'
import {
  confirmForm,
  doLogin,
  fillEmail,
  fillPassword,
  loadRecaptchaScript,
} from 'pages/authenticate-user/__tests__/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('My Regulars - Unauthenticate', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should see the login dialog from the my regulars page', async () => {
    wrap(App).atPath('/my-products').mount()

    await screen.findByText('Log in to see your essentials')
    openSignIn()
    const signInDialog = await screen.findByRole('dialog')

    expect(signInDialog).toHaveTextContent('Enter your email')
  })

  it('should be able to login from the my regulars page', async () => {
    const readyMock = vi.fn((cb) => cb())
    const executeMock = vi.fn().mockResolvedValue('recaptcha_token')
    window.grecaptcha = {
      enterprise: {
        ready: readyMock,
        execute: executeMock,
      },
    }
    const uuid = '1'
    const responses = [
      {
        method: 'post',
        path: '/customers/actions/check-email/',
        requestBody: { email: 'johndoe@gmail.com' },
        responseBody: { account_exists: true },
      },
      {
        method: 'post',
        path: '/auth/tokens/',
        requestBody: {
          username: 'johndoe@gmail.com',
          password: 'my_password',
          recaptcha_token: 'recaptcha_token',
        },
        responseBody: { access_token: '', customer_id: uuid },
      },
      { path: `/customers/${uuid}/`, responseBody: user },
      { path: `/customers/${uuid}/cart/`, responseBody: emptyCart },
      {
        path: `/customers/${uuid}/cart/`,
        method: 'put',
        requestBody: { id: '5529dc8b-0a94-4ae0-8145-de5186b542c6', lines: [] },
      },
      {
        path: `/customers/${uuid}/recommendations/myregulars/`,
        responseBody: recommendations,
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).mount()

    await screen.findByText('Log in to see your essentials')
    openSignIn()
    await screen.findByRole('dialog')
    loadRecaptchaScript()
    fillEmail('johndoe@gmail.com')
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword('my_password')
    doLogin()
    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_click', {
      email: 'johndoe@gmail.com',
      source: 'recommendations',
    })
  })
})
