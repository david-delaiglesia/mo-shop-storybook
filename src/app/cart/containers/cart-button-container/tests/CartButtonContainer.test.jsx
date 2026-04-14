import { screen, within } from '@testing-library/react'

import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import { cart, expensiveCart } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'

describe('<CartButtonContainer />', () => {
  describe('ButtonCart size', () => {
    it('should be BIG', async () => {
      const responses = [
        { path: '/home/', responseBody: homeWithGrid },
        {
          path: `/customers/1/cart/?lang=en&wh=vlc1`,
          responseBody: expensiveCart,
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      const cartButton = await screen.findByRole('button', {
        name: 'cart.aria_open',
      })
      const price = within(cartButton).getByText('170,00 €')
      const amount = within(cartButton).getByText('200')

      expect(price).toHaveAttribute('style', 'width: 57px;')
      expect(amount).toHaveAttribute(
        'style',
        'border-radius: 15px; width: 30px;',
      )
      expect(cartButton).toHaveAttribute('style', 'min-width: 129px;')
    })

    it('should be DEFAULT', async () => {
      const responses = [
        { path: '/home/', responseBody: homeWithGrid },
        {
          path: `/customers/1/cart/?lang=en&wh=vlc1`,
          responseBody: cart,
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      const cartButton = await screen.findByRole('button', {
        name: 'cart.aria_open',
      })

      const amount = within(cartButton).getByText('2')

      const price = within(cartButton).getByText('1,70 €')

      expect(price).toHaveAttribute('style', 'width: 44px;')
      expect(amount).toHaveAttribute(
        'style',
        'border-radius: 12px; width: 24px;',
      )
      expect(cartButton).toHaveAttribute('style', 'min-width: 120px;')
    })
  })
})
