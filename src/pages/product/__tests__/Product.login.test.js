import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  productBaseDetail,
  productWithoutXSelling,
} from 'app/catalog/__scenarios__/product'
import { openAccountDropdown, openSignInModal } from 'pages/helpers'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Product - Private view', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  Object.defineProperty(global.Image.prototype, 'src', {
    set() {
      this.onload()
    },
  })

  it('should show the product detail properly', async () => {
    const responses = [
      {
        path: '/products/8731/',
        responseBody: productBaseDetail,
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )

    const productImage = screen.getByAltText(
      'Main product image Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    expect(productImage).toHaveAttribute(
      'src',
      'fideos-orientales-first-image.jpg?fit=crop&h=600&w=600',
    )
    expect(
      screen.getByText(
        'The pack or product shown may not be up-to-date. We recommend that you check it upon receipt to confirm the details about it and its allergens. For additional information, contact us at our customer service Freephone 800 500 220.',
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Paquete').closest('div')).toHaveTextContent(
      'Paquete 90 g | 9,44 €/kg',
    )
    expect(screen.getByText('0,85 €').closest('div')).toHaveTextContent(
      '0,85 € /unit',
    )
    expect(screen.getByText('Add to cart')).toBeInTheDocument()
  })

  it('should open the login modal', async () => {
    const responses = [
      {
        path: '/products/8731/',
        responseBody: productBaseDetail,
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    openAccountDropdown()
    openSignInModal()
    const loginModal = await screen.findByRole('dialog')

    expect(loginModal).toHaveTextContent('Enter your email')
    expect(window.location.search).toBe('?authenticate-user=')
  })
})
