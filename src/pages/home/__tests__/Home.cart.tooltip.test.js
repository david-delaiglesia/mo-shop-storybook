import { screen } from '@testing-library/react'

import { clickOutsideMoreActionsMenu, closePopoverDialog } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cart } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import 'pages/authenticate-user/__tests__/helpers'
import { openCart } from 'pages/home/__tests__/helpers'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

it('should not call tooltip API if user is not logged in', async () => {
  const responses = [
    { path: '/home/', responseBody: homeWithGrid },
    { path: '/cart/', responseBody: cart },
  ]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Novedades')
  openCart()

  expect('/customers/undefined/tooltips/cart-to-list/').not.toHaveBeenFetched()
  expect(screen.queryByText('Save in a new list')).not.toBeInTheDocument()
})

it('should display cart to list tooltip if user has not seen it', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
    {
      method: 'post',
      path: '/customers/1/tooltips/cart-to-list/',
      responseBody: {
        show_tooltip: true,
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  openCart()
  await screen.findByText('Save in a new list')

  expect(
    screen.getByText(
      'Now you can save the products in your cart in a new list.',
    ),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', { name: 'botón tooltip' }),
  ).not.toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'sl_cart_to_list_tooltip_view',
  )
})

it('should not show tooltip if user has already seen it', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
    {
      method: 'post',
      path: '/customers/1/tooltips/cart-to-list/',
      responseBody: {
        show_tooltip: false,
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  openCart()

  expect(screen.queryByText('Save in a new list')).not.toBeInTheDocument()
})

it('should properly close cart to list tooltip', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
    {
      method: 'post',
      path: '/customers/1/tooltips/cart-to-list/',
      responseBody: {
        show_tooltip: true,
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  await screen.findByText('Save in a new list')
  closePopoverDialog()

  expect(screen.queryByText('Save in a new list')).not.toBeInTheDocument()
  expect(
    screen.queryByText(
      'Now you can save the products in your cart in a new list.',
    ),
  ).not.toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'sl_cart_to_list_tooltip_close',
    {
      source: 'cross',
    },
  )
})

it('should properly close cart to list tooltip when clicking outside of it', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    { path: '/customers/1/cart/', responseBody: cart },
    {
      method: 'post',
      path: '/customers/1/tooltips/cart-to-list/',
      responseBody: {
        show_tooltip: true,
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')

  openCart()
  await screen.findByText('Save in a new list')
  clickOutsideMoreActionsMenu()

  expect(screen.queryByText('Save in a new list')).not.toBeInTheDocument()
  expect(
    screen.queryByText(
      'Now you can save the products in your cart in a new list.',
    ),
  ).not.toBeInTheDocument()
  expect(screen.getByText('Cart')).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'sl_cart_to_list_tooltip_close',
    {
      source: 'backdrop_click',
    },
  )
})
