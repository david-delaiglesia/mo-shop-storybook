import { screen } from '@testing-library/react'

import { clickOutsideMoreActionsMenu, openCartActionsMenu } from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { cart, emptyLocalCart } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { emptyCart, openCart } from 'pages/home/__tests__/helpers'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

it('should display the three dots button instead of clear button when opening cart', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  expect(
    screen.getByRole('button', { name: 'more actions' }),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'Vaciar' }),
  ).not.toBeInTheDocument()
})

it('should close the more actions menu when clicking outside of it', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  openCartActionsMenu()
  clickOutsideMoreActionsMenu()
  expect(
    screen.queryByRole('button', { name: 'Save to new list' }),
  ).not.toBeInTheDocument()
})

it('should display dropdown with option to create and delete a list when clicking on cart options', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  openCartActionsMenu()
  expect(screen.getByRole('button', { name: 'Save to new list' }))
  expect(screen.getByRole('button', { name: 'Empty cart' }))
})

it('should delete cart when clicking on "empty cart"', async () => {
  activeFeatureFlags(['web-accessibility-cart'])

  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  openCartActionsMenu()
  emptyCart()
  expect(
    screen.getByRole('dialog', {
      name: 'Empty cart. Are you sure you want to empty your cart?',
    }),
  )
})

it('should disable the three dots button when there are no products in cart', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: emptyLocalCart },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  expect(
    screen.getByRole('button', {
      name: 'more actions',
    }),
  ).toBeDisabled()
})
