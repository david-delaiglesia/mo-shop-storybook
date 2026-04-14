import { screen } from '@testing-library/react'

import { displayShoppingLists, navigateToShoppingListDetail } from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  productBaseDetail,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { recommendations } from 'app/catalog/__scenarios__/recommendations'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { order } from 'app/order/__scenarios__/orderDetail'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
import { addProduct, decreaseProduct } from 'pages/helpers'
import { mockSearch } from 'pages/search/__tests__/algolia.mock'
import {
  shoppingListDetail,
  shoppingLists,
} from 'pages/shopping-lists/__tests__/scenarios'
import { suggestions } from 'pages/shopping-lists/__tests__/scenarios.suggestions'
import { knownFeatureFlags } from 'services/feature-flags'
import { MOAnalytics } from 'services/mo-analytics'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')
vi.mock('services/mo-analytics', () => ({
  MOAnalytics: {
    captureEvent: vi.fn(),
  },
}))

vi.mock('services/tracker', async (importOriginal) => importOriginal())

vi.mock('algoliasearch', () => {
  const algoliasearch = () => ({
    searchSingleIndex: ({ searchParams }: { searchParams: unknown }) =>
      mockSearch(searchParams),
  })

  return { algoliasearch }
})

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  global.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver
  Object.defineProperty(window, 'gtag', { value: vi.fn(), writable: true })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should NOT send add product click event in edit order product when flag is OFF', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  activeFeatureFlags([knownFeatureFlags.WEB_CUSTOM_EVENT_IMPLEMENTATION])

  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: order },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/products/3317/', responseBody: productBaseDetail },
      {
        path: '/products/3317/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')

  addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.not.objectContaining({
        page: 'category-112',
        section: 'category-420',
        section_position: 0,
        position: 0,
      }),
    }),
  )
})

it('should send add product click event in categories under the order detail page when category flag is ON', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD,
    knownFeatureFlags.WEB_CUSTOM_EVENT_IMPLEMENTATION,
  ])
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: order },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/products/3317/', responseBody: productBaseDetail },
      {
        path: '/products/3317/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')

  addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        page: 'category-112',
        section: 'category-420',
        section_position: 0,
        position: 0,
      }),
    }),
  )
})

it('should enrich decrease_product_click payload in edit order when category flag is ON', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD,
    knownFeatureFlags.WEB_CUSTOM_EVENT_IMPLEMENTATION,
  ])
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: order },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/products/3317/', responseBody: productBaseDetail },
      { path: '/products/3317/xselling/', responseBody: productXSelling },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')

  addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'decrease_product_click',
      properties: expect.objectContaining({
        page: 'category-112',
        section: 'category-420',
        section_position: 0,
        position: 0,
      }),
    }),
  )
})

it('should NOT enrich decrease_product_click payload in edit order when category flag is OFF', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  activeFeatureFlags([knownFeatureFlags.WEB_CUSTOM_EVENT_IMPLEMENTATION])

  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: order },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/products/3317/', responseBody: productBaseDetail },
      { path: '/products/3317/xselling/', responseBody: productXSelling },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')

  addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'decrease_product_click',
      properties: expect.not.objectContaining({
        page: 'category-112',
        section: 'category-420',
        section_position: 0,
        position: 0,
      }),
    }),
  )
})

it('should NOT send impression event for shopping list in edit order when category flag is ON', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD,
    knownFeatureFlags.WEB_CUSTOM_EVENT_IMPLEMENTATION,
  ])
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)

  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: order },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      {
        path: '/customers/1/shopping-lists/550e8400-e29b-41d4-a716-446655440000/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
      {
        path: '/customers/1/shopping-lists/550e8400-e29b-41d4-a716-446655440000/suggested-products/',
        responseBody: suggestions,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')
  displayShoppingLists()
  await navigateToShoppingListDetail()
  await screen.findByRole('heading', { name: 'My second list', level: 1 })

  addProduct('strawberry and banana Kefir drink Hacendado')
  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.not.objectContaining({
        page: 'category-112',
        section: 'category-420',
        section_position: 0,
        position: 0,
      }),
    }),
  )
})
