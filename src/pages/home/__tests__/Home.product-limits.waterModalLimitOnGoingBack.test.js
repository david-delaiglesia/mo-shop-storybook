import { screen, within } from '@testing-library/react'

import { closeWaterLimitAlert, startCheckout } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { repeatOrderLinesWith12Water } from 'app/cart/__scenarios__/cart'
import { homeWithDeliveredWidget } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import {
  confirmRepeatOrder,
  repeatOrder,
} from 'pages/user-area/__tests__/helpers'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

it('should go to the checkout page, go back and show the water modal limit ', async () => {
  const responses = [
    {
      path: '/customers/1/home/',
      responseBody: homeWithDeliveredWidget,
    },
    {
      path: '/customers/1/orders/1005/repeat/',
      responseBody: { results: repeatOrderLinesWith12Water },
    },
    {
      path: '/customers/1/cart/?lang=en&wh=vlc1',
      method: 'put',
      requestBody: {
        id: '10000000-1000-4000-8000-100000000000',
        lines: [
          { quantity: 50, product_id: '8731', sources: ['+RO', '+RO'] },
          {
            quantity: 12,
            product_id: '28491',
            sources: ['+RO', '+RO', '+RO'],
          },
        ],
      },
      responseBody: { results: repeatOrderLinesWith12Water },
    },
    {
      path: '/customers/1/checkouts/?lang=en&wh=vlc1',
      method: 'post',
      status: 400,
      requestBody: {
        cart: {
          id: '10000000-1000-4000-8000-100000000000',
          lines: [
            { quantity: 50, product_id: '8731', sources: ['+RO', '+RO'] },
            {
              quantity: 12,
              product_id: '28491',
              sources: ['+RO', '+RO', '+RO'],
            },
          ],
        },
      },
      responseBody: {
        errors: [
          {
            detail:
              'The water limit per order is 100 litres. You have to remove 17 litres.',
            code: 'max_water_liters_in_cart_error',
          },
        ],
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Próxima entrega')

  repeatOrder()
  confirmRepeatOrder()
  await screen.findByText('Cart updated')
  startCheckout()

  const alert = await screen.findByRole('dialog')
  within(alert).getByText(
    'The water limit per order is 100 litres. You have to remove 17 litres.',
  )
  closeWaterLimitAlert()

  expect(
    screen.getByRole('searchbox', {
      name: 'Search products',
    }),
  ).toBeInTheDocument()
})
