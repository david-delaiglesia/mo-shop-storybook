import { screen } from '@testing-library/react'

import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithBannerProduct } from 'app/catalog/__scenarios__/home'
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

it('should NOT include page in impression payload for highlighted when flag is OFF', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithBannerProduct }])
    .mount()

  await screen.findByText('Es tendencia')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({ page: expect.any(String) }),
    }),
  )
})

it('should call MOAnalytics.captureEvent for highlighted when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithBannerProduct }])
    .mount()

  await screen.findByText('Es tendencia')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'impression',
      properties: expect.objectContaining({
        page: 'home',
        merca_code: '8731',
        center_code: 'mad1',
        section: 'producto-destacado',
        section_position: 0,
        position: 0,
        elapsed_time: 1,
      }),
    }),
  )
  expect(MOAnalytics.captureEvent).not.toHaveBeenCalledWith(
    expect.objectContaining({ name: 'home_impression' }),
  )
  expect(MOAnalytics.captureEvent).not.toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({ campaign_id: expect.any(String) }),
    }),
  )
})

it('should include layout highlighted string in highlighted impression payload when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithBannerProduct }])
    .mount()

  await screen.findByText('Es tendencia')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        layout: 'highlighted',
      }),
    }),
  )
})
