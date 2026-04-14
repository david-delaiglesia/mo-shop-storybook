import { screen } from '@testing-library/react'

import {
  addProductToCartWithFocus,
  decreaseProductInCart,
  increaseProductInCart,
  openCart,
  openChangeAddressModal,
  openSortingDropdown,
  removeProductFromCart,
  selectInputAddress,
  sortByCategory,
  sortByTime,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { cart, cartWithSources } from 'app/cart/__scenarios__/cart'
import {
  cartApiResponse,
  cartApiResponseWithUnpublished,
  cartWithMultipleProductsApiResponse,
} from 'app/cart/__tests__/cart.mock'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  productBaseDetail,
  productWithoutXSelling,
} from 'app/catalog/__scenarios__/product'
import {
  getProductCell,
  getProductCellFromCart,
  openProductDetailFromCart,
} from 'pages/helpers'
import { HttpXHeaders } from 'services/http'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Cart', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
  })

  it('should be able to open the cart', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
    ]
    const metrics = {
      cart_id: '5529dc8b-0a94-4ae0-8145-de5197b542c6',
      item_count: 2,
      total_units: 4,
      total_price: 21.43,
      unpublished_products: 1,
      ongoing_order: false,
    }
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')
    openCart()

    expect(Tracker.sendViewChange).toHaveBeenCalledWith('cart', metrics)
  })

  it('should allow to focus the change address modal opened from the cart', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
      { path: '/customers/1/addresses/', responseBody: { results: [] } },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findByText('Delivery in 46010')
    openChangeAddressModal('46010')
    await screen.findByRole('dialog')
    selectInputAddress()

    expect(screen.getByLabelText('Street and number')).toHaveFocus()
  })

  it('should increase and decrease product from the cart', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cartWithSources },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 2, product_id: '8731', sources: ['+CT', '+CA'] }],
        },
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { quantity: 1, product_id: '8731', sources: ['+CT', '+CA', '-CA'] },
          ],
        },
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findAllByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    const product = getProductCellFromCart(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )

    increaseProductInCart(product)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'add_product_click',
      expect.objectContaining({
        layout: 'list',
        source: 'cart',
        order: 0,
      }),
    )

    decreaseProductInCart(product)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      expect.objectContaining({
        layout: 'list',
        source: 'cart',
      }),
    )

    removeProductFromCart(product)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'decrease_product_click',
      expect.objectContaining({
        layout: 'list',
        source: 'cart',
      }),
    )
  })

  it('should sort cart products by categories', async () => {
    const homeWithGridClone = cloneDeep(homeWithGrid)
    homeWithGridClone.sections[1].content.items[1].categories[0] = {
      id: 1,
      name: 'Fruta y verdura',
      level: 0,
      order: 304,
    }

    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGridClone },
      {
        path: '/customers/1/cart/',
        responseBody: cartWithMultipleProductsApiResponse,
      },
    ]

    const metrics = {
      method: 'categories',
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
    }
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')
    openCart()

    openSortingDropdown()
    sortByCategory()

    const categories = screen.getAllByRole('heading')

    const indexFruta = categories.findIndex((category) =>
      category.textContent.includes('Fruta y verdura'),
    )
    const indexLimpieza = categories.findIndex((category) =>
      category.textContent.includes('Limpieza y hogar'),
    )
    const indexBodega = categories.findIndex((category) =>
      category.textContent.includes('Bodega'),
    )

    expect(indexBodega).toBeLessThan(indexFruta)
    expect(indexFruta).toBeLessThan(indexLimpieza)
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'cart_sorting_method_click',
      metrics,
    )
  })

  it('should sort cart products by insertion date', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cartApiResponse },
    ]
    const metrics = {
      method: 'time',
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
    }
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')
    openCart()
    openSortingDropdown()
    sortByCategory()
    openSortingDropdown()
    sortByTime()
    const [firstProduct, secondProduct] =
      screen.getAllByTestId('cart-product-cell')

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'cart_sorting_method_click',
      metrics,
    )
    expect(firstProduct).toHaveTextContent('Uva blanca con semillas')
    expect(secondProduct).toHaveTextContent(
      'Plataforma mopa grande abrillantadora Bosque Verde',
    )
  })

  it('should display the cart total price', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cartApiResponse },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')

    expect(screen.getByLabelText('Show cart')).toHaveTextContent('21,43 €')
  })

  it('should show the product in the cart', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cartApiResponse },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')

    const productCell = getProductCell('Uva blanca con semillas')
    expect(productCell).toHaveTextContent('9,44 €')
  })

  it('should be able to add a product to the cart', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cartApiResponse },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { quantity: 1, product_id: '8731', sources: ['+NA'] },
            { quantity: 2, product_id: '3317', sources: [] },
            { quantity: 3, product_id: '71502', sources: [] },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')
    const productCell = getProductCell(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    addProductToCartWithFocus(productCell)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith('focus_recovery_click')
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
      amount: 0,
      cart_id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
      id: '8731',
      merca_code: '8731',
      layout: 'grid',
      price: '0,85',
      requires_age_check: false,
      selling_method: 'units',
      source: 'new_arrivals',
      cart_mode: 'purchase',
      order: 0,
      first_product: false,
      added_amount: 1,
    })
  })

  it('should send price as number in add_product_click when price number format flag is ON', async () => {
    activeFeatureFlags(['web-mo-analytics-price-number-format'])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cartApiResponse },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [
            { quantity: 1, product_id: '8731', sources: ['+NA'] },
            { quantity: 2, product_id: '3317', sources: [] },
            { quantity: 3, product_id: '71502', sources: [] },
          ],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')
    const productCell = getProductCell(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    addProductToCartWithFocus(productCell)

    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'add_product_click',
      expect.objectContaining({
        price: 0.85,
      }),
    )
  })

  it('should be able to increase a product from the modal detail opened from the cart product cell', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cart },
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 3, product_id: '8731', sources: ['+CA'] }],
        },
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')
    openCart()
    await screen.findAllByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    openProductDetailFromCart(
      'Fideos orientales Yakisoba sabor pollo Hacendado, Paquete, 90 Grams, 0,85€ per Unit',
    )
    const productDetail = await screen.findByRole('dialog')
    increaseProductInCart(productDetail)
    await screen.findAllByText('3 units')

    expect(productDetail).toHaveTextContent('3 units')
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 3, product_id: '8731', sources: ['+CA'] }],
      },
    })
  })

  it('should send the device id in the requests', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Estimated cost')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: {
          map: expect.objectContaining({
            [HttpXHeaders.X_CUSTOMER_DEVICE_ID]: 'device-id',
          }),
        },
      }),
    )
  })
})
