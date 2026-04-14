import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
import { addProduct, decreaseProduct } from 'pages/helpers'
import { knownFeatureFlags } from 'services/feature-flags'
import { Session } from 'services/session'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  global.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver
  Object.defineProperty(window, 'gtag', { value: vi.fn(), writable: true })
  Session.get = vi.fn().mockReturnValue({ warehouse: 'mad1', isAuth: false })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should not enrich add_product_click payload when flag is OFF in category page', async () => {
  activeFeatureFlags([])

  wrap(App)
    .atPath('/categories/112/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ])
    .mount()

  await screen.findAllByText('Aceite, vinagre y sal')
  const [productCell] = screen.getAllByTestId('product-cell')
  userEvent.click(within(productCell).getByText('Add to cart'))

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'add_product_click',
    expect.not.objectContaining({
      page: 'category-112',
      section: 'category-420',
      position: 0,
      section_position: 0,
    }),
  )
})

it('should enrich add_product_click payload with category data when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD])

  wrap(App)
    .atPath('/categories/112/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ])
    .mount()

  await screen.findAllByText('Aceite, vinagre y sal')
  const [productCell] = screen.getAllByTestId('product-cell')
  userEvent.click(within(productCell).getByText('Add to cart'))

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'add_product_click',
    expect.objectContaining({
      page: 'category-112',
      section: 'category-420',
      position: 0,
      section_position: 0,
    }),
  )
})

it('should enrich decrease_product_click payload with category data when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD])

  wrap(App)
    .atPath('/categories/112/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ])
    .mount()

  await screen.findAllByText('Aceite, vinagre y sal')
  addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'decrease_product_click',
    expect.objectContaining({
      page: 'category-112',
      section: 'category-420',
      position: 0,
      section_position: 0,
    }),
  )
})

it('should not enrich decrease_product_click payload when flag is OFF in category page', async () => {
  activeFeatureFlags([])

  wrap(App)
    .atPath('/categories/112/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ])
    .mount()

  await screen.findAllByText('Aceite, vinagre y sal')
  addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'decrease_product_click',
    expect.not.objectContaining({
      page: 'category-112',
      section: 'category-420',
      position: 0,
      section_position: 0,
    }),
  )
})
