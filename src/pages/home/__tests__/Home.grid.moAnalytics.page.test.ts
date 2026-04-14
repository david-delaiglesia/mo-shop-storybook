import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { newArrivals } from 'app/catalog/__scenarios__/sections'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
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

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.useFakeTimers()
  global.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver
})

it('should use section as page value in impression payload when not on home (flag ON)', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  wrap(App)
    .atPath('/home/new-arrivals')
    .withNetwork([
      { path: '/customers/1/home/new-arrivals/', responseBody: newArrivals },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Novedades')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        page: 'new-arrivals',
        section: 'new-arrivals',
      }),
    }),
  )
})

it('should send section_position 0 in impression payload when not on home (flag ON)', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  wrap(App)
    .atPath('/home/new-arrivals')
    .withNetwork([
      { path: '/customers/1/home/new-arrivals/', responseBody: newArrivals },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Novedades')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledWith(
    expect.objectContaining({
      properties: expect.objectContaining({
        merca_code: '8731',
        section_position: 0,
      }),
    }),
  )
})
