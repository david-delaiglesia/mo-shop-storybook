import { screen, within } from '@testing-library/react'

import { cloneDeep } from '../../../utils/objects'
import {
  closeWaterLimitAlert,
  confirmAgeVerificationAlert,
  startCheckout,
} from './helpers'
import { wrap } from 'wrapito'

import { App } from 'app'
import {
  emptyCart,
  repeatOrderLinesWith12Water,
} from 'app/cart/__scenarios__/cart'
import { homeWithDeliveredWidget } from 'app/catalog/__scenarios__/home'
import { productWithAgeVerification } from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import {
  confirmRepeatOrder,
  repeatOrder,
} from 'pages/user-area/__tests__/helpers'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

it('should allow to repeat the order and show the age verification alert and the water limit error from backend', async () => {
  const cartWith12WaterAndAgeVerification = cloneDeep(emptyCart)
  cartWith12WaterAndAgeVerification.lines = [
    ...repeatOrderLinesWith12Water,
    {
      product: productWithAgeVerification,
      quantity: 4,
      sources: [],
    },
  ]

  const responses = [
    {
      path: '/customers/1/home/',
      responseBody: homeWithDeliveredWidget,
    },
    {
      path: '/customers/1/orders/1005/repeat/',
      responseBody: {
        results: [
          ...repeatOrderLinesWith12Water,
          {
            product: productWithAgeVerification,
            quantity: 4,
            sources: [],
          },
        ],
      },
    },

    {
      path: `/customers/1/cart/?lang=en&wh=vlc1`,
      multipleResponses: [
        { responseBody: emptyCart },
        { responseBody: cartWith12WaterAndAgeVerification },
      ],
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
      responseBody: {
        results: [
          ...repeatOrderLinesWith12Water,
          {
            product: productWithAgeVerification,
            quantity: 4,
            sources: [],
          },
        ],
      },
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
            { quantity: 4, product_id: '28775', sources: [] },
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
  const repeatOrderModal = screen.getByRole('dialog', {
    name: 'Repeat order. By continuing, the products and quantities of this order will be added to your cart. Do not forget to check the cart to make sure you have everything you need.',
  })
  confirmRepeatOrder()
  await screen.findByText('Cart updated')

  screen.getByLabelText('Show cart')
  expect(repeatOrderModal).not.toBeInTheDocument()

  startCheckout()
  const ageVerificationAlert = screen.getByRole('dialog')
  confirmAgeVerificationAlert()
  expect(ageVerificationAlert).not.toBeInTheDocument()

  expect(
    screen.getByRole('button', {
      name: 'Checkout',
    }),
  ).toBeInTheDocument()

  const alert = await screen.findByRole('dialog')

  expect(
    within(alert).getByText(
      'The water limit per order is 100 litres. You have to remove 17 litres.',
    ),
  )
  closeWaterLimitAlert()
  expect(
    screen.getByRole('button', {
      name: 'Checkout',
    }),
  ).toBeInTheDocument()
})
