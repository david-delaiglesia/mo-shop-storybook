import { screen } from '@testing-library/react'

import { addProductToCart } from '../helpers'
import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import { cart, emptyCart } from 'app/cart/__scenarios__/cart'
import { homeWithBannerProduct } from 'app/catalog/__scenarios__/home'
import { productBaseDetail } from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import {
  acceptLoginSuggestion,
  cancelLoginSuggestion,
} from 'pages/authenticate-user/__tests__/helpers'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

afterEach(() => {
  localStorage.clear()
})

it('should display a dialog for sign in in when the user adds the first highlighted product and is not logged in', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithBannerProduct }])
    .mount()

  await screen.findByText('Lists')
  const bannerProduct = screen.getByLabelText(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  addProductToCart(bannerProduct)

  expect(
    screen.getByRole('heading', { name: 'Do you already have an account?' }),
  ).toBeInTheDocument()
})

it('should allow to close the login suggestion dialog', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithBannerProduct }])
    .mount()

  await screen.findByText('Lists')
  const bannerProduct = screen.getByLabelText(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  addProductToCart(bannerProduct)
  cancelLoginSuggestion()

  expect(
    screen.queryByRole('heading', { name: 'Do you already have an account?' }),
  ).not.toBeInTheDocument()
})

it('should display the log in page when accepting the dialog', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithBannerProduct }])
    .mount()

  await screen.findByText('Lists')
  const bannerProduct = screen.getByLabelText(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  addProductToCart(bannerProduct)
  await acceptLoginSuggestion()

  expect(await screen.findByText('Enter your email')).toBeInTheDocument()
})

it('should not display the dialog if the user cart is not empty', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/home/', responseBody: homeWithBannerProduct },
      { path: '/carts/', responseBody: cart },
    ])
    .mount()

  await screen.findByText('Lists')
  const bannerProduct = screen.getByLabelText(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  addProductToCart(bannerProduct)
  cancelLoginSuggestion()
  addProductToCart(bannerProduct)

  expect(
    screen.queryByRole('heading', { name: 'Do you already have an account?' }),
  ).not.toBeInTheDocument()
})

it('should not display the dialog if the user is already logged in', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithBannerProduct },
      { path: '/customers/1/cart/', responseBody: emptyCart },
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Lists')
  const bannerProduct = screen.getByLabelText(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  addProductToCart(bannerProduct)

  expect(
    screen.queryByRole('heading', { name: 'Do you already have an account?' }),
  ).not.toBeInTheDocument()
})
