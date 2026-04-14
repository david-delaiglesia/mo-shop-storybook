import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Product - Unavailable', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should show the empty state when the product is unavailable', async () => {
    const responses = [{ path: '/products/8731/', status: 410 }]
    wrap(App).atPath('/product/8731').withNetwork(responses).mount()

    const title = await screen.findByText('Product not available')

    expect(title).toBeInTheDocument()
    expect(
      screen.getByText('This product is not available at the moment'),
    ).toBeInTheDocument()
    expect(screen.getByText('See other products')).toBeInTheDocument()
    expect(Tracker.sendViewChange).toHaveBeenCalledWith('product_empty_case', {
      product_id: '8731',
    })
  })
})
