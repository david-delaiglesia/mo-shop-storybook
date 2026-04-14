import { screen } from '@testing-library/react'

import { shoppingLists } from './scenarios'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { emptyCart } from 'app/cart/__scenarios__/cart'
import {
  homeWithGrid,
  homeWithRecommendations,
} from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { user } from 'app/user/__scenarios__/user'
import {
  confirmForm,
  doLogin,
  fillEmail,
  fillPassword,
  loadRecaptchaScript,
} from 'pages/authenticate-user/__tests__/helpers'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

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

it('should load the shopping lists after an anonymous user logs in from that page', async () => {
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
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]
  wrap(App)
    .atPath('/shopping-lists/?authenticate-user')
    .withNetwork(responses)
    .mount()

  await screen.findByText('Sign in', { selector: 'h1' })
  loadRecaptchaScript()
  fillEmail(email)
  confirmForm()
  await screen.findByText('Hello again')
  fillPassword(password)
  doLogin()
  await screen.findByRole('heading', { level: 1, name: 'Lists' })

  expect(screen.getByText('My first list')).toBeInTheDocument()
  expect(screen.getByText('1 product')).toBeInTheDocument()
  expect(screen.getByText('My second list')).toBeInTheDocument()
  expect(screen.getByText('2 products')).toBeInTheDocument()
})
