import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { cartApiWithQuantityLimitResponse } from 'app/cart/__tests__/cart.mock'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { recommendations } from 'app/catalog/__scenarios__/recommendations'
import { mockedOrder } from 'app/order/__tests__/order.mock'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
import {
  emptyShoppingListDetail,
  shoppingListDetail,
  shoppingLists,
} from 'pages/shopping-lists/__tests__/scenarios'
import { knownFeatureFlags } from 'services/feature-flags'
import { MOAnalytics } from 'services/mo-analytics'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

vi.mock('services/mo-analytics', () => ({
  MOAnalytics: {
    captureEvent: vi.fn(),
  },
}))

vi.mock('services/tracker', async (importOriginal) => importOriginal())

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.useFakeTimers()
  global.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

it('should not send impression event in edit orders', async () => {
  const responses = [
    { path: '/customers/1/orders/1235/', responseBody: mockedOrder },
    {
      path: `/customers/1/orders/1235/cart/`,
      responseBody: cartApiWithQuantityLimitResponse,
    },
    { path: '/categories/', responseBody: categories },
    { path: '/categories/112/', responseBody: categoryDetail },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]
  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork(responses)
    .withLogin()
    .mount()

  await screen.findByText('Products in my order')

  expect(
    screen.getByRole('heading', { name: 'Aceite, vinagre y sal' }),
  ).toBeVisible()

  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})

it('should not send impression event in shopping list', async () => {
  const cloneShoppingListDetail = cloneDeep(shoppingListDetail)
  cloneShoppingListDetail.items[0].product.published = false

  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: cloneShoppingListDetail,
          },
          { responseBody: emptyShoppingListDetail },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  const [strawberryBananaKeffir] = screen.getAllByTestId('product-cell')
  expect(strawberryBananaKeffir).toBeVisible()

  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})

it('should not send impression event in my products', async () => {
  const responses = [
    {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    },
  ]
  wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})

it('should not send impression event in my regulars list', async () => {
  const responses = [
    {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    },
  ]
  wrap(App)
    .atPath('/shopping-lists/my-regulars')
    .withNetwork(responses)
    .withLogin()
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})

it('should not send impression event in search results', async () => {
  wrap(App)
    .atPath('/search-results?query=jam')
    .withNetwork()
    .withLogin()
    .mount()

  await screen.findByText(/Showing 3 results for 'jam'/)

  expect(screen.getByText('Pizzas y platos preparados')).toBeInTheDocument()

  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})
