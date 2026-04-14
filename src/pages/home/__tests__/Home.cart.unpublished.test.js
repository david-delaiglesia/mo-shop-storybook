import { screen } from '@testing-library/react'

import { removeProductFromCart } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cartApiResponseWithUnpublished,
  unPublishedProduct,
} from 'app/cart/__tests__/cart.mock'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { productBase } from 'app/catalog/__scenarios__/product'
import { getAllProductFromCart, getProductCellFromCart } from 'pages/helpers'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Unpublished cart products', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  window.matchMedia = vi.fn().mockReturnValue({ matches: true })
  const { product: firstPublishedProductAtCart } =
    cartApiResponseWithUnpublished.lines[1]
  const { product: secondPublishedProductAtCart } =
    cartApiResponseWithUnpublished.lines[2]

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should show the total cart without the unpublished products', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartApiResponseWithUnpublished.id,
          lines: [
            {
              product_id: firstPublishedProductAtCart.id,
              quantity: 2,
              sources: [],
            },
            {
              product_id: secondPublishedProductAtCart.id,
              quantity: 3,
              sources: [],
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    const checkoutInfo = await screen.findByTestId('cart__checkout__info')

    expect(checkoutInfo).toHaveTextContent('Estimated cost')
    expect(checkoutInfo).toHaveTextContent('21,43 €')
  })

  it('should be able to remove unpublished product order line', async () => {
    const { id, badges, display_name } = unPublishedProduct
    const { id: cart_id } = cartApiResponseWithUnpublished
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartApiResponseWithUnpublished.id,
          lines: [
            {
              product_id: firstPublishedProductAtCart.id,
              quantity: 2,
              sources: [],
            },
            {
              product_id: secondPublishedProductAtCart.id,
              quantity: 3,
              sources: [],
            },
          ],
        },
        responseBody: {
          id: cartApiResponseWithUnpublished.id,
          version: 2,
          lines: [
            {
              product: productBase,
              version: 1,
              quantity: 55,
              sources: ['+NA'],
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')
    const unpublishedOrderLine = getProductCellFromCart(
      unPublishedProduct.display_name,
    )
    removeProductFromCart(unpublishedOrderLine)
    await screen.findByText('Cart')

    expect(
      screen.queryByText(unPublishedProduct.display_name),
    ).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'remove_from_cart_click',
      {
        id,
        merca_code: id,
        display_name,
        cart_id,
        price: '10,00',
        amount: 1,
        selling_method: 'units',
        source: 'cart',
        layout: 'cell',
        requires_age_check: badges.requires_age_check,
        cart_mode: 'purchase',
      },
    )
  })

  it('should open cart button show items and total', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        method: 'get',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartApiResponseWithUnpublished.id,
          version: 1,
          lines: [
            {
              product_id: firstPublishedProductAtCart.id,
              quantity: 2,
              sources: [],
            },
            {
              product_id: secondPublishedProductAtCart.id,
              quantity: 3,
              sources: [],
            },
          ],
        },
        responseBody: {
          id: cartApiResponseWithUnpublished.id,
          version: 2,
          lines: [
            {
              product: productBase,
              version: 1,
              quantity: 55,
              sources: ['+NA'],
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    const openCartButton = await screen.findByLabelText('Show cart')

    expect(openCartButton).toHaveTextContent('4')
    expect(openCartButton).toHaveTextContent('21,43 €')
  })

  it('should show the unpublished title', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: cartApiResponseWithUnpublished.id,
          lines: [
            {
              product_id: firstPublishedProductAtCart.id,
              quantity: 2,
              sources: [],
            },
            {
              product_id: secondPublishedProductAtCart.id,
              quantity: 3,
              sources: [],
            },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    const unpublishedProductsTitle = await screen.findByText(
      'You have unavailable products in your cart',
    )
    expect(unpublishedProductsTitle).toBeInTheDocument()
  })

  it('should show unpublished product order line at the beginning of the cart', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
          lines: [
            {
              product: unPublishedProduct,
              quantity: 1,
              sources: [],
            },
            {
              product: productBase,
              quantity: 1,
              sources: [],
            },
          ],
          summary: {
            total: '64.9',
          },
          products_count: 5,
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Cart')

    const allOrderLines = getAllProductFromCart()

    const unpublishedProduct = allOrderLines[0]
    const publishedProduct = allOrderLines[1]

    expect(unpublishedProduct.textContent).toContain('Product not available')

    expect(publishedProduct.textContent).toContain(
      'Fideos orientales Yakisoba sabor pollo Hacendado0,85 € /unitIn cart1 unitAdd to cart',
    )
  })
})
