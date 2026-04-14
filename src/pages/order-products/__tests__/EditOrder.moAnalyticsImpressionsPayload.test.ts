import { screen } from '@testing-library/react'

import {
  displayShoppingLists,
  navigateToShoppingListDetail,
  searchProducts,
} from './helpers'
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
  vi.useFakeTimers()
  global.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver
  Object.defineProperty(window, 'gtag', { value: vi.fn(), writable: true })
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

it('should NOT send impression event in edit order product when flag is OFF', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

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

  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})

it('should send impression event in categories under the order detail page when category flag is ON', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD,
    knownFeatureFlags.WEB_MO_ANALYTICS_CATEGORY_IMPRESSIONS,
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
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        merca_code: '8731',
        section: 'category-420',
        layout: 'grid',
        center_code: 'vlc1',
        page: 'category-112',
        section_position: 0,
        position: 0,
        elapsed_time: 1,
        cart_mode: 'edit',
      }),
    }),
  )
})

it('should NOT send impression event for search results in edit order when category flag is ON', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD,
    knownFeatureFlags.WEB_MO_ANALYTICS_CATEGORY_IMPRESSIONS,
  ])

  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: order },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Products in my order')
  searchProducts('jam')
  await screen.findByText('Jamón serrano Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})

it('should NOT send impression event for shopping list in edit order when category flag is ON', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD,
    knownFeatureFlags.WEB_MO_ANALYTICS_CATEGORY_IMPRESSIONS,
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
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})
