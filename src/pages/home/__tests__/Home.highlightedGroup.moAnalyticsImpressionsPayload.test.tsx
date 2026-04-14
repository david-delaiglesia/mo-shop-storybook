import { screen } from '@testing-library/react'

import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithHighlightedGroup } from 'app/catalog/__scenarios__/home'
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

it('should call MOAnalytics.captureEvent for highlighted_group when flag is ON', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_HIGHLIGHTED_GROUP,
    knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD,
  ])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithHighlightedGroup }])
    .mount()

  await screen.findByText('Dos productos destacados')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'impression',
      properties: expect.objectContaining({
        page: 'home',
        merca_code: '8731',
        center_code: 'mad1',
        section: 'vlc1-mad1-dos-productos-destacados',
        section_position: 0,
        position: 0,
        elapsed_time: 1,
        cart_mode: 'purchase',
      }),
    }),
  )
  expect(MOAnalytics.captureEvent).not.toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({ campaign_id: expect.any(String) }),
    }),
  )
})

it('should include layout highlighted string in highlightedGroup impression payload when flag is ON', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_HIGHLIGHTED_GROUP,
    knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD,
  ])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithHighlightedGroup }])
    .mount()

  await screen.findByText('Dos productos destacados')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        layout: 'highlighted',
      }),
    }),
  )
})

it('should NOT call MOAnalytics.captureEvent for highlighted_group when flag is OFF', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_HIGHLIGHTED_GROUP])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithHighlightedGroup }])
    .mount()

  await screen.findByText('Dos productos destacados')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})
