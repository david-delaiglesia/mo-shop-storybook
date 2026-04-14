import { screen } from '@testing-library/react'

import { wrap } from 'wrapito'

import { App } from 'app'
import { homeWithBanner } from 'app/catalog/__scenarios__/home'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
import { MOAnalytics } from 'services/mo-analytics'

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
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

it('should not call MOAnalytics.captureEvent with impression for banner when flag is OFF', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithBanner }])
    .mount()

  await screen.findByText('Productos del momento')
  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).not.toHaveBeenCalled()
})
