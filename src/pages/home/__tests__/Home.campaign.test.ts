import { screen } from '@testing-library/react'

import { wrap } from 'wrapito'

import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { Tracker } from 'services/tracker'

describe('Home - Campaign', () => {
  it('should track the campaign if present as a query param', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/?campaign=verano').withNetwork(responses).mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

    expect(Tracker.setUserProperties).toHaveBeenCalledWith({
      campaign: 'verano',
    })
  })
})
