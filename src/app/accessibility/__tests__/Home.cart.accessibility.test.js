import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { cart } from 'app/cart/__scenarios__/cart'
import {
  cartApiResponseWithUnpublished,
  unPublishedProduct,
} from 'app/cart/__tests__/cart.mock'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { similarResults } from 'app/catalog/__tests__/similar.mock'
import { closeCart, openCart, viewSimilarProductsFromCart } from 'pages/helpers'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Cart - Accessibility', () => {
  it('should not send the focus to the close cart button if the cart is closed', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        { path: '/customers/1/cart/', responseBody: cart },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Cart')

    const closeCartButton = screen.getByRole('button', {
      name: 'Close cart and continue adding products',
    })
    expect(closeCartButton).not.toHaveFocus()
  })

  it('should send the focus to the close cart button', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        { path: '/customers/1/cart/', responseBody: cart },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Cart')
    openCart()

    const closeCartButton = screen.getByRole('button', {
      name: 'Close cart and continue adding products',
    })
    expect(closeCartButton).toHaveFocus()
  })

  it('should restore the focus to the open cart button', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        { path: '/customers/1/cart/', responseBody: cart },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Cart')
    openCart()
    closeCart()

    const openCartButton = screen.getByRole('button', { name: 'Show cart' })
    expect(openCartButton).toHaveFocus()
  })

  it('should keep the focus in the cart', async () => {
    wrap(App)
      .atPath('/')
      .withNetwork([
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        { path: '/customers/1/cart/', responseBody: cart },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Cart')
    openCart()
    userEvent.tab({ shift: true })

    const checkoutButton = screen.getByRole('button', { name: 'Checkout' })
    expect(checkoutButton).toHaveFocus()
  })

  it('should have the dialog of an unpublished product with accessible properties', async () => {
    activeFeatureFlags(['web-accessibility-cart'])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: `/products/${unPublishedProduct.id}/similars/?exclude=3317,28757,71502&lang=es&wh=vlc1`,
        responseBody: similarResults,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')

    viewSimilarProductsFromCart(unPublishedProduct.display_name)

    const similarModal = await screen.findByRole('dialog')

    const alternativesTitle = within(similarModal).getByLabelText(
      '3 Alternatives Available for Ron dominicano añejo Ron Barceló, Paquete, 1 Kilo',
    )

    expect(alternativesTitle).toHaveFocus()
    expect(
      screen.getByAltText(
        'Main product image Ron dominicano añejo Ron Barceló',
      ),
    ).toHaveAttribute('aria-hidden', 'true')
    expect(
      screen.getByText(
        'Choose one or more alternatives to replace the unavailable product',
      ),
    ).toHaveAttribute('aria-hidden', 'true')
  })
})
