import { screen, within } from '@testing-library/react'

import { emptyCart, openCartActionsMenu } from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { cart } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  closeCart,
  closeCleanCartAlert,
  confirmCleanCartAlert,
  openCart,
} from 'pages/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Cart - Empty', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should show an empty button cart', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const cartButton = screen.getByLabelText('Show cart')
    expect(cartButton).toHaveClass('cart-button--empty')
    expect(cartButton).toHaveOnlyIcon()
  })

  it('should show an empty cart', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    const cart = screen.getByLabelText('Cart')
    expect(cart).toContainElement(screen.getByAltText('empty-cart'))
    expect(cart).toHaveTextContent(
      'You have not yet added any products to your cart',
    )
  })

  it('should open the cart', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openCart()

    const cart = screen.getByLabelText('Cart')
    expect(cart).toHaveClass('cart--open')
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('cart', {
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      item_count: 0,
      ongoing_order: false,
      total_price: 0,
      total_units: 0,
      unpublished_products: 0,
    })
  })

  it('should close the cart', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    openCart()
    closeCart()

    const cart = screen.getByLabelText('Cart')
    expect(cart).not.toHaveClass('cart--open')
  })

  it('should display the clean cart alert', async () => {
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

    const alert = screen.getByRole('dialog', {
      name: 'Empty cart. Are you sure you want to empty your cart?',
    })
    expect(
      within(alert).getByText('Are you sure you want to empty your cart?'),
    ).toBeInTheDocument()
    expect(
      within(alert).getByRole('button', { name: 'Cancel' }),
    ).toBeInTheDocument()
    expect(
      within(alert).getByRole('button', { name: 'Empty cart' }),
    ).toBeInTheDocument()
  })

  it('should close the clean cart alert', async () => {
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
    const alert = screen.getByRole('dialog', {
      name: 'Empty cart. Are you sure you want to empty your cart?',
    })
    closeCleanCartAlert()

    expect(alert).not.toBeInTheDocument()
  })

  it('should confirm the clean cart alert', async () => {
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
    const alert = screen.getByRole('dialog', {
      name: 'Empty cart. Are you sure you want to empty your cart?',
    })
    confirmCleanCartAlert()

    expect(alert).not.toBeInTheDocument()
    const cartButton = screen.getByLabelText('Show cart')
    expect(cartButton).toHaveClass('cart-button--empty')
    expect(cartButton).toHaveOnlyIcon()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'clean_cart_confirmation_click',
      {
        cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        items_count: 2,
      },
    )
  })
})
