import { screen } from '@testing-library/react'

import { openMyRegulars } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  productBaseDetail,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import {
  recommendations,
  recommendationsWithUnpublished,
} from 'app/catalog/__scenarios__/recommendations'
import { similars } from 'app/catalog/__scenarios__/similars'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { order } from 'app/order/__scenarios__/orderDetail'
import {
  openProductDetail,
  openProductDetailFromCartInEditOrder,
  viewSimilarProducts,
} from 'pages/helpers'
import { navigateToShoppingLists } from 'pages/shopping-lists/__tests__/helpers.js'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order - catalog', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should load the categories for the order warehouse', async () => {
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: order },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Products in my order')

    expect('/categories/?lang=en&wh=vlc1').toHaveBeenFetched()
    expect(
      '/categories/112/?lang=en&wh=vlc1&display_temporarily_unavailable=false',
    ).toHaveBeenFetched()
  })

  it('should load my regulars for the order warehouse', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        { path: '/customers/1/orders/1235/', responseBody: order },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        {
          path: '/customers/1/recommendations/myregulars/',
          responseBody: recommendations,
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    navigateToShoppingLists()
    await screen.findByText('My second list')
    openMyRegulars()
    await screen.findByRole('heading', { name: 'My Essentials' })

    expect(
      '/customers/1/recommendations/myregulars/?lang=en&wh=vlc1',
    ).toHaveBeenFetched()
  })

  it('should load the product detail for the order warehouse', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        { path: '/customers/1/orders/1235/', responseBody: order },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        { path: '/products/8731/', responseBody: productBaseDetail },
        {
          path: '/products/8731/xselling/',
          responseBody: productXSelling,
        },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByText('Related products')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining('/products/8731/?lang=en&wh=vlc1'),
        method: 'GET',
      }),
    )
    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(
          '/products/8731/xselling/?lang=en&wh=vlc1&exclude=3317,71502',
        ),
        method: 'GET',
      }),
    )
  })

  it('should load the similar products for the order warehouse', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        { path: '/customers/1/orders/1235/', responseBody: order },
        { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
        { path: '/categories/', responseBody: categories },
        { path: '/categories/112/', responseBody: categoryDetail },
        {
          path: '/customers/1/recommendations/myregulars/',
          responseBody: recommendationsWithUnpublished,
        },
        { path: '/products/3317/similars/', responseBody: similars },
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    navigateToShoppingLists()
    await screen.findByText('My second list')
    openMyRegulars()
    await screen.findByRole('heading', { name: 'My Essentials' })
    viewSimilarProducts('Uva blanca con semillas')
    await screen.findByRole('dialog')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(
          '/products/3317/similars/?lang=en&wh=vlc1&exclude=3317,71502',
        ),
        method: 'GET',
      }),
    )
  })

  describe('when new_product_detail_endpoint FF is active', () => {
    it('should load the cart product detail for the order warehouse', async () => {
      wrap(App)
        .atPath('/orders/1235/edit/products/')
        .withNetwork([
          { path: '/customers/1/orders/1235/', responseBody: order },
          { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
          { path: '/categories/', responseBody: categories },
          { path: '/categories/112/', responseBody: categoryDetail },
          {
            path: '/customers/1/orders/1235/products/3317/?lang=en&wh=vlc1',
            responseBody: productBaseDetail,
          },
          {
            path: '/products/3317/xselling/',
            responseBody: productXSelling,
          },
          { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Aceite, vinagre y sal')
      openProductDetailFromCartInEditOrder(
        'Uva blanca con semillas, Paquete, 200 Grams, 1,89€ per 200 Grams',
      )
      const productDetail = await screen.findByRole('dialog')

      expect(productDetail).toHaveTextContent('Uva blanca con semillas')
      expect(productDetail).toHaveTextContent('Related products')
      expect(global.fetch).toHaveBeenCalledWith(
        expect.objectContaining({
          url: expect.stringContaining(
            '/customers/1/orders/1235/products/3317/?lang=en&wh=vlc1',
          ),
          method: 'GET',
        }),
      )
    })

    it('should load the category product detail from the catalog', async () => {
      wrap(App)
        .atPath('/orders/1235/edit/products/')
        .withNetwork([
          { path: '/customers/1/orders/1235/', responseBody: order },
          { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
          { path: '/categories/', responseBody: categories },
          { path: '/categories/112/', responseBody: categoryDetail },
          { path: '/products/8731/', responseBody: productBaseDetail },
          {
            path: '/products/8731/xselling/',
            responseBody: productXSelling,
          },
          { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
        ])
        .withLogin()
        .mount()

      await screen.findByText('Aceite, especias y salsas')
      await openProductDetail(
        'Fideos orientales Yakisoba sabor pollo Hacendado',
      )
      const productDetail = await screen.findByRole('dialog')

      expect(productDetail).toHaveTextContent(
        'Descripción Fideos orientales Yakisoba sabor pollo',
      )
      expect(productDetail).toHaveTextContent('Related products')
    })
  })
})
