import { screen } from '@testing-library/react'

import { doFocus, openCart, setOffline, setOnline } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cart,
  cartWithDifferentQuantity,
  emptyCart,
} from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Home - Cart synchronization', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  describe('when do focus', () => {
    it('should synchronize the cart', async () => {
      const responses = [
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          multipleResponses: [
            { responseBody: cart },
            { responseBody: cartWithDifferentQuantity },
          ],
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      const cartPrice = await screen.findByLabelText('Show cart')

      expect(cartPrice).toHaveTextContent('1,70 €')

      doFocus()

      const updatedCartPrice = await screen.findByLabelText('Show cart')
      expect(updatedCartPrice).toHaveTextContent('3,40 €')
    })

    it('should synchronize the fetched cart when is empty', async () => {
      const responses = [
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          multipleResponses: [
            { responseBody: cart },
            { responseBody: emptyCart },
          ],
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      const cartPrice = await screen.findByLabelText('Show cart')

      expect(cartPrice).toHaveTextContent('1,70 €')

      doFocus()

      const updatedCartPrice = await screen.findByLabelText('Show cart')
      expect(updatedCartPrice).toHaveOnlyIcon()
      expect(updatedCartPrice).not.toHaveTextContent('1,70 €')
    })
  })

  describe('when offline', () => {
    it('should synchronize the cart when online', async () => {
      const responses = [
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        { path: '/customers/1/cart/', responseBody: cart },
        {
          path: '/customers/1/cart/',
          method: 'put',
          requestBody: {
            id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
            lines: [
              {
                product_id: '8731',
                quantity: 2,
                sources: [],
              },
            ],
          },
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      await screen.findByLabelText('Show cart')

      expect(
        screen.queryByText(
          'It seems that you have lost your internet connection.',
        ),
      ).not.toBeInTheDocument()

      setOffline()

      expect(
        screen.getByText(
          'It seems that you have lost your internet connection.',
        ),
      ).toBeInTheDocument()

      setOnline()
      await screen.findByLabelText('Show cart')

      expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
        'lost_connectivity_editing_order',
      )
      expect(
        screen.queryByText(
          'It seems that you have lost your internet connection.',
        ),
      ).not.toBeInTheDocument()
    })
  })

  describe('when open the cart', () => {
    it('should synchronize the cart', async () => {
      const responses = [
        { path: '/customers/1/home/', responseBody: homeWithGrid },
        {
          path: '/customers/1/cart/',
          multipleResponses: [
            { responseBody: cart },
            { responseBody: cartWithDifferentQuantity },
          ],
        },
      ]
      wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

      await screen.findByLabelText('Show cart')
      openCart()
      const openedCart = await screen.findByLabelText('Cart')

      expect(openedCart).toHaveTextContent('3,40 €')
    })
  })
})
