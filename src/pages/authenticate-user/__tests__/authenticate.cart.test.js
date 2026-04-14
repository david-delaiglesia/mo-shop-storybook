import { act, screen, within } from '@testing-library/react'

import {
  acceptLoginSuggestion,
  cancelLoginSuggestion,
  confirmForm,
  doLogin,
  fillEmail,
  fillPassword,
  loadRecaptchaScript,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cart, validatedLocalCart } from 'app/cart/__scenarios__/cart'
import {
  homeWithGrid,
  homeWithRecommendations,
} from 'app/catalog/__scenarios__/home'
import {
  productBaseDetail,
  productWithoutXSelling,
} from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { user } from 'app/user/__scenarios__/user'
import {
  addProduct,
  addProductFromDetail,
  openProductDetail,
} from 'pages/helpers'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Authenticate - Login', () => {
  beforeAll(() => {
    vi.useFakeTimers()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  configure({
    changeRoute: (route) => history.push(route),
  })

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

  it('should suggest the login after adding the first product from the product cell', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    const loginSuggestionDialog = await screen.findByRole('dialog')

    expect(loginSuggestionDialog).toHaveTextContent(
      'Do you already have an account?',
    )
    expect(loginSuggestionDialog).toHaveTextContent(
      'If you already added products from your account, remember to log in so you don’t lose them.',
    )
    expect(loginSuggestionDialog).toHaveTextContent('Sign in')
    expect(loginSuggestionDialog).toHaveTextContent('Not now')
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'force_login_popup_alert',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'add_product_click',
      expect.objectContaining({ first_product: true }),
    )
  })

  it('should open login modal after accept login suggestion on product cell', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    const modal = await screen.findByRole('dialog')
    await acceptLoginSuggestion()
    const email = await screen.findByText('Enter your email')

    expect(modal).not.toBeInTheDocument()
    expect(email).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'force_login_popup_alert_login_click',
    )
  })

  it('should merge the products after the login suggestion on product cell', async () => {
    const email = 'johndoe@gmail.com'
    const password = 'my_password'
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
        responseBody: { access_token: '', customer_id: '1' },
      },
      { path: '/customers/1/', responseBody: user },
      {
        path: '/customers/1/home/',
        responseBody: homeWithRecommendations,
      },
      { path: '/customers/1/cart/', responseBody: cart },
      {
        path: '/carts/',
        method: 'post',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [{ quantity: 1, product_id: '8731', sources: ['+NA'] }],
        },
        responseBody: validatedLocalCart,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByRole('dialog')
    await acceptLoginSuggestion()
    await screen.findByText('Enter your email')
    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await screen.findAllByText('Recomendado para ti')

    expect(
      within(screen.getByLabelText('Show cart')).getByText('3'),
    ).toBeInTheDocument()
    expect(
      within(screen.getByLabelText('Show cart')).getByText('2,55 €'),
    ).toBeInTheDocument()
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 3, product_id: '8731', sources: ['+NA'] }],
      },
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_click', {
      email: 'johndoe@gmail.com',
      source: 'dialog',
    })
  })

  it('should alert modal when remote products are merged', async () => {
    const email = 'johndoe@gmail.com'
    const password = 'my_password'
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
        responseBody: { access_token: '', customer_id: '1' },
      },
      { path: '/customers/1/', responseBody: user },
      {
        path: '/customers/1/home/',
        responseBody: homeWithRecommendations,
      },
      { path: '/customers/1/cart/', responseBody: cart },
      {
        path: '/carts/',
        method: 'post',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [{ quantity: 1, product_id: '8731', sources: ['+NA'] }],
        },
        responseBody: validatedLocalCart,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByRole('dialog')
    await acceptLoginSuggestion()
    await screen.findByText('Enter your email')
    loadRecaptchaScript()
    fillEmail(email)
    confirmForm()
    await screen.findByText('Hello again')
    fillPassword(password)
    doLogin()
    await screen.findByText('Cart updated')

    expect(
      screen.getByText(
        'Do not forget to check it to make sure you have everything you need.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Check cart')).toBeInTheDocument()
    expect(screen.getByLabelText('Show cart')).toHaveTextContent('3')
  })

  it('should close the login suggestion alert from the product cell', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    const loginSuggestionDialog = await screen.findByRole('dialog')
    cancelLoginSuggestion()

    expect(loginSuggestionDialog).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'force_login_popup_alert_cancel_click',
    )
  })

  it('should not suggest the login from the product cell if the user is logged', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 1, product_id: '8731', sources: ['+NA'] }],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByLabelText('Show cart')

    expect(
      screen.queryByText('Do you already have an account?'),
    ).not.toBeInTheDocument()
  })

  it('should suggest the login after adding the first product from a product detail', async () => {
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByRole('dialog')
    await addProductFromDetail(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const loginSuggestionDialog = await screen.findByLabelText(
      'Do you already have an account?',
    )

    expect(loginSuggestionDialog).toHaveTextContent(
      'Do you already have an account?',
    )
    expect(loginSuggestionDialog).toHaveTextContent(
      'If you already added products from your account, remember to log in so you don’t lose them.',
    )
    expect(loginSuggestionDialog).toHaveTextContent('Sign in')
    expect(loginSuggestionDialog).toHaveTextContent('Not now')
    expect(Tracker.sendViewChange).toHaveBeenCalledWith(
      'force_login_popup_alert',
    )
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'add_product_click',
      expect.objectContaining({ first_product: true }),
    )
  })

  it('should open login modal after accept login suggestion on product detail', async () => {
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByRole('dialog')
    await addProductFromDetail(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const loginSuggestionDialog = await screen.findByLabelText(
      'Do you already have an account?',
    )
    await acceptLoginSuggestion()
    const email = await screen.findByText('Enter your email')

    expect(loginSuggestionDialog).not.toBeInTheDocument()
    expect(email).toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'force_login_popup_alert_login_click',
    )
  })

  it('should merge the products after the login suggestion on product detail', async () => {
    const email = 'johndoe@gmail.com'
    const password = 'my_password'
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
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
        responseBody: { access_token: '', customer_id: '1' },
      },
      { path: '/customers/1/', responseBody: user },
      {
        path: '/customers/1/home/',
        responseBody: homeWithRecommendations,
      },
      { path: '/customers/1/cart/', responseBody: cart },
      {
        path: '/carts/',
        method: 'post',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [{ quantity: 1, product_id: '8731', sources: ['+NA'] }],
        },
        responseBody: validatedLocalCart,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 1, product_id: '28757', sources: ['+RO'] }],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByRole('dialog')
    await addProductFromDetail(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    await screen.findByLabelText('Do you already have an account?')
    await acceptLoginSuggestion()
    await screen.findByText('Enter your email')
    await act(async () => {
      await loadRecaptchaScript()
      await fillEmail(email)
      await confirmForm()
      await screen.findByText('Hello again')
      fillPassword(password)
      doLogin()
      await screen.findAllByText('Recomendado para ti')
    })

    expect(
      within(screen.getByLabelText('Show cart')).getByText('3'),
    ).toBeInTheDocument()
    expect(
      within(screen.getByLabelText('Show cart')).getByText('2,55 €'),
    ).toBeInTheDocument()
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 3, product_id: '8731', sources: ['+NA'] }],
      },
    })
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('auth_login_click', {
      email: 'johndoe@gmail.com',
      source: 'dialog',
    })
  })

  it('should close the login suggestion alert from the product detail', async () => {
    const responses = [
      { path: '/home/', responseBody: homeWithGrid },
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByRole('dialog')
    await addProductFromDetail(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const loginSuggestionDialog = await screen.findByLabelText(
      'Do you already have an account?',
    )
    cancelLoginSuggestion()

    expect(loginSuggestionDialog).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'force_login_popup_alert_cancel_click',
    )
  })

  it('should not suggest the login from the product detail if the user is logged', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 1, product_id: '8731', sources: ['+NA'] }],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByRole('dialog')
    await addProductFromDetail(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    await screen.findByLabelText('Show cart')

    expect(
      screen.queryByText('Do you already have an account?'),
    ).not.toBeInTheDocument()
  })
})
