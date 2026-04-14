import { screen } from '@testing-library/react'

import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithVideoSection } from 'app/catalog/__scenarios__/home'
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

  //STRIKE 3 Mock Canvas globally
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () =>
      ({
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        drawImage: vi.fn(),
      }) as unknown as CanvasRenderingContext2D,
  )
  Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
    set: () => {},
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

it('should NOT send impression when WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD flag is OFF', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithVideoSection }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})

it('should NOT send impression before 1 second has elapsed', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_VIDEO_SECTION,
    knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD,
  ])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithVideoSection }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})

it('should send impression with complete payload after product is visible for 1 second', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_VIDEO_SECTION,
    knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD,
  ])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithVideoSection }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        page: 'home',
        merca_code: '8731',
        center_code: 'mad1',
        section: 'summer-recipes',
        layout: 'video',
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
