import { screen } from '@testing-library/react'

import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { knownFeatureFlags } from 'services/feature-flags'
import { MOAnalytics } from 'services/mo-analytics'

vi.mock('services/mo-analytics', () => ({
  MOAnalytics: {
    captureEvent: vi.fn(),
  },
}))

vi.mock('services/tracker', async (importOriginal) => importOriginal())

const simulateLeaveViewPort = () => {
  for (const observer of observerInstances) {
    for (const element of observer.observedElements) {
      observer.callback(
        [
          {
            isIntersecting: false,
            intersectionRatio: 0,
            target: element,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      )
    }
  }
}

const simulateEnterViewPort = () => {
  for (const observer of observerInstances) {
    for (const element of observer.observedElements) {
      observer.callback(
        [
          {
            isIntersecting: true,
            intersectionRatio: 0.6,
            target: element,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver,
      )
    }
  }
}

interface ObserverInstance {
  callback: IntersectionObserverCallback
  observedElements: Element[]
}

let observerInstances: ObserverInstance[]

beforeEach(() => {
  vi.useFakeTimers()
  observerInstances = []

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      callback: IntersectionObserverCallback
      observedElements: Element[] = []

      constructor(callback: IntersectionObserverCallback) {
        this.callback = callback
        observerInstances.push(this)
      }

      observe = vi.fn((element: Element) => {
        this.observedElements.push(element)
        this.callback(
          [
            {
              isIntersecting: true,
              intersectionRatio: 0.6,
              target: element,
            } as IntersectionObserverEntry,
          ],
          this as unknown as IntersectionObserver,
        )
      })

      disconnect = vi.fn()
    },
  )
})

afterEach(() => {
  vi.useRealTimers()
  vi.clearAllMocks()
})

it('should send impression again when product re-enters viewport after leaving when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGrid }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  simulateLeaveViewPort()
  simulateEnterViewPort()

  await vi.advanceTimersByTimeAsync(1000)

  expect(MOAnalytics.captureEvent).toHaveBeenCalledTimes(4)
})

it('should NOT send impression again if product re-enters viewport but 1 second has not been passed', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_MO_ANALYTICS_IMPRESSIONS_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGrid }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  await vi.advanceTimersByTimeAsync(1000)

  simulateLeaveViewPort()
  simulateEnterViewPort()

  expect(MOAnalytics.captureEvent).toHaveBeenCalledTimes(2)
})
