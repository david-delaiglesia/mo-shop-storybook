import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
import { knownFeatureFlags } from 'services/feature-flags'
import { MOAnalytics } from 'services/mo-analytics'
import { Session } from 'services/session'

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
  Object.defineProperty(window, 'gtag', { value: vi.fn(), writable: true })
  Session.get = vi.fn().mockReturnValue({ warehouse: 'mad1', isAuth: false })
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

it('should NOT send impression event in category page when only home flags are ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  wrap(App)
    .atPath('/categories/112/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ])
    .mount()

  await screen.findAllByText('Aceite, vinagre y sal')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})

it('should send impression event in category page when category flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_CATEGORY_IMPRESSIONS])

  wrap(App)
    .atPath('/categories/112/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ])
    .mount()

  await screen.findAllByText('Aceite, vinagre y sal')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        merca_code: '8731',
        section: 'category-420',
        layout: 'grid',
        center_code: 'mad1',
        page: 'category-112',
        section_position: 0,
        position: 0,
        elapsed_time: 1,
        cart_mode: 'purchase',
      }),
    }),
  )
})

it('should NOT send impression event in category page when category flag is OFF', async () => {
  activeFeatureFlags([])

  wrap(App)
    .atPath('/categories/112/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ])
    .mount()

  await screen.findAllByText('Aceite, vinagre y sal')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})
