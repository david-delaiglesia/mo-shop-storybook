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

it('should call MOAnalytics.captureEvent for carousel when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  const homeWithGridCopy = structuredClone(homeWithGrid)
  homeWithGridCopy.sections[1].content.source = 'price-drops'
  homeWithGridCopy.sections[1].layout = 'carousel'

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGridCopy }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'impression',
      properties: expect.objectContaining({
        merca_code: '8731',
        center_code: 'mad1',
        section: 'price-drops',
        page: 'home',
        position: 0,
        elapsed_time: 1,
      }),
    }),
  )
  expect(MOAnalytics.captureEvent).not.toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({ product_id: expect.any(String) }),
    }),
  )
  expect(MOAnalytics.captureEvent).not.toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({ campaign_id: expect.any(String) }),
    }),
  )
})

it('should include layout carrousel string in carousel impression payload when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  const homeWithGridCopy = structuredClone(homeWithGrid)
  homeWithGridCopy.sections[1].content.source = 'price-drops'
  homeWithGridCopy.sections[1].layout = 'carousel'

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGridCopy }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        layout: 'carousel',
      }),
    }),
  )
})

it('should include section_position in impression payload for carousel when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  const homeWithGridCopy = structuredClone(homeWithGrid)
  homeWithGridCopy.sections[1].content.source = 'price-drops'
  homeWithGridCopy.sections[1].layout = 'carousel'

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGridCopy }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'impression',
      properties: expect.objectContaining({
        merca_code: '8731',
        section_position: 0,
      }),
    }),
  )
})

it('should NOT include display_name or home_section_type in carousel impression payload when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  const homeWithGridCopy = structuredClone(homeWithGrid)
  homeWithGridCopy.sections[1].content.source = 'price-drops'
  homeWithGridCopy.sections[1].layout = 'carousel'

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGridCopy }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        display_name: expect.any(String),
        home_section_type: expect.any(String),
      }),
    }),
  )
})
