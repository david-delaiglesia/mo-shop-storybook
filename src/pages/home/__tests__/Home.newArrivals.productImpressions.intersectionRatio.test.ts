import { screen } from '@testing-library/react'

import { wrap } from 'wrapito'

import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { IntersectionObserverMock } from 'pages/__tests__/IntersectionObserverMock'
import { Tracker } from 'services/tracker'

beforeEach(() => {
  vi.useFakeTimers()
  global.IntersectionObserver =
    IntersectionObserverMock as unknown as typeof IntersectionObserver
})

afterEach(() => {
  vi.useRealTimers()
})

it('should not send the event if the intersection ratio is lower than the 50%', async () => {
  const homeWithGridCopy = structuredClone(homeWithGrid)

  homeWithGridCopy.sections[1].content.source = 'new-arrivals'
  const responses = [{ path: '/home/', responseBody: homeWithGridCopy }]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

  await vi.advanceTimersByTimeAsync(1100)

  expect(Tracker.sendInteraction).not.toHaveBeenCalledWith('impression', {
    product_id: '8731',
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    source: 'new_arrivals',
    layout: 0,
  })
})
