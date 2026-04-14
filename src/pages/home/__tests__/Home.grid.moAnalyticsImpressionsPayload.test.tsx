import { screen } from '@testing-library/react'

import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
import { knownFeatureFlags } from 'services/feature-flags'
import { MOAnalytics } from 'services/mo-analytics'
import { Session } from 'services/session'

vi.mock('services/mo-analytics', () => ({
  MOAnalytics: {
    captureEvent: vi.fn(),
  },
}))

vi.mock('services/tracker', async (importOriginal) => importOriginal())

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

it('should call MOAnalytics.captureEvent for grid when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  const homeWithGridCopy = structuredClone(homeWithGrid)
  homeWithGridCopy.sections[1].content.source = 'new-arrivals'

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGridCopy }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        page: 'home',
        merca_code: '8731',
        center_code: 'mad1',
        section: 'new-arrivals',
        section_position: 0,
        position: 0,
        elapsed_time: 1,
        cart_mode: 'purchase',
      }),
    }),
  )
  expect(MOAnalytics.captureEvent).not.toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({ source: expect.any(String) }),
    }),
  )
})

it('should include layout grid string in grid impression payload when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGrid }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        layout: 'grid',
      }),
    }),
  )
})

it('should NOT include display_name in grid impression payload when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGrid }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({ display_name: expect.any(String) }),
    }),
  )
})

it('should send position 1 for the second product in grid impression payload when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGrid }])
    .mount()

  await screen.findByText('Uva blanca con semillas')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        merca_code: '3317',
        position: 1,
      }),
    }),
  )
})

it('should send section_position 1 for the second trackable section in grid impression payload when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  const homeWithTwoGrids = structuredClone(homeWithGrid)
  homeWithTwoGrids.sections.push(structuredClone(homeWithGrid.sections[1]))
  homeWithTwoGrids.sections[2].content.source = 'price-drops'

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithTwoGrids }])
    .mount()

  await screen.findAllByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        merca_code: '8731',
        section_position: 1,
        section: 'price-drops',
      }),
    }),
  )
})
