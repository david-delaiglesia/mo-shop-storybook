import { screen, within } from '@testing-library/react'

import {
  clickOnElement,
  openMyRegulars,
  searchProducts,
  seeAllProducts,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  manyRecommendations,
  recommendations,
  recommendationsWithUnpublished,
} from 'app/catalog/__scenarios__/recommendations'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { getProductCellFromCart } from 'pages/helpers'
import { navigateToShoppingLists } from 'pages/shopping-lists/__tests__/helpers.js'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Edit order - My regulars', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    sessionStorage.clear()
  })

  const defaultResponses = [
    { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
    { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
    { path: '/categories/', responseBody: categories },
    { path: '/categories/112/', responseBody: categoryDetail },
    {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]

  it('should add the recommended quantity for NO WATER products', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    navigateToShoppingLists()
    await screen.findByText('My second list')
    openMyRegulars()
    await screen.findByRole('heading', { name: 'My Essentials' })
    const [yakisobaInDetail] = screen.getAllByRole('button', {
      name: 'Add to cart',
    })
    clickOnElement(yakisobaInDetail)

    const [yakisobaInCart] = screen.getAllByTestId('cart-product-cell')
    expect(within(yakisobaInCart).getByText('1 unit')).toBeInTheDocument()
  })

  it('should add the recommended quantity for WATER products', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork([
        {
          path: '/customers/1/recommendations/myregulars/',
          responseBody: manyRecommendations,
        },
        ...defaultResponses,
      ])
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    navigateToShoppingLists()
    await screen.findByText('My second list')
    openMyRegulars()
    await screen.findByRole('heading', { name: 'My Essentials' })
    const [, , waterInDetail] = screen.getAllByRole('button', {
      name: 'Add to cart',
    })
    clickOnElement(waterInDetail)

    const [water] = screen.getAllByTestId('cart-product-cell')
    expect(within(water).getByText('1 pack')).toBeInTheDocument()
  })

  it('should clear the search value when going to my regulars', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(defaultResponses)
      .withLogin()
      .mount()

    await screen.findAllByText('Aceite, especias y salsas')
    searchProducts('jam')
    await screen.findByText('Jamón serrano Hacendado')
    navigateToShoppingLists()
    await screen.findByText('My second list')

    expect(
      screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Search products').value).toBe('')
  })

  it('should display as published all products in the cart', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendationsWithUnpublished,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')
    navigateToShoppingLists()
    await screen.findByText('My second list')
    openMyRegulars()
    await screen.findByRole('heading', { name: 'My Essentials' })

    const product = getProductCellFromCart('Uva blanca con semillas')
    expect(
      screen.queryByText('There is 1 product not available'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Products not available')).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        'These products are not currently available. If you confirm the purchase they will not be included.',
      ),
    ).not.toBeInTheDocument()
    expect(product).toHaveTextContent('Add to cart')
    expect(product).not.toHaveTextContent('View alternative')
  })

  it('should navigate to edit order categories page when there are not recommendations', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
    const responses = [
      { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: [],
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ]
    wrap(App)
      .atPath('/orders/1235/edit/products/')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText('Aceite, especias y salsas')

    navigateToShoppingLists()
    await screen.findByText('My second list')
    openMyRegulars()

    await screen.findByText('Make your first order to see your essentials')
    seeAllProducts()

    await screen.findByText('Products in my order')
    await screen.findByText('Aceite de oliva')

    expect(screen.getByText('Aceite, especias y salsas')).toBeInTheDocument()
  })
})
