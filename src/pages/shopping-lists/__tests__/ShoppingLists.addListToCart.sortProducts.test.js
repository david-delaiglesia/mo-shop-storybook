import { screen } from '@testing-library/react'

import {
  cartWithMilka,
  cartWithShoppingListDetail,
} from './cart-response-scenario'
import { shoppingListDetail } from './scenarios'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { addListToCart } from 'pages/shopping-lists/__tests__/helpers'
import { Cookie } from 'services/cookie'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should keep the shopping list products order in the cart even if there was an existing product in the cart', async () => {
  const productAlreadyInCart = cloneDeep(cartWithShoppingListDetail).lines[0]
  const cartCopy = cloneDeep(cartWithMilka)
  cartCopy.lines.push(productAlreadyInCart)

  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/cart/',
        responseBody: cartCopy,
      },
      {
        path: '/customers/1/cart/',
        method: 'PUT',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          version: 6,
          lines: [
            { quantity: 1, product_id: '52750', sources: ['+SL'] },
            { quantity: 1, product_id: '10672', sources: ['+SL'] },
            { quantity: 0.3, product_id: '24706', sources: ['+PL', '+SL'] },
            { quantity: 1, version: 4, product_id: '12151', sources: ['+SL'] },
          ],
        },
        responseBody: cartCopy,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  addListToCart()
  await screen.findByRole('dialog')

  expect('/customers/1/cart/').toHaveBeenFetchedWith({
    method: 'PUT',
    body: {
      id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      lines: [
        {
          quantity: 1,
          product_id: '52750',
          sources: ['+SL'],
        },
        {
          quantity: 1,
          product_id: '10672',
          sources: ['+SL'],
        },
        {
          quantity: 0.3,
          product_id: '24706',
          sources: ['+PL', '+SL'],
        },
        {
          quantity: 1,
          product_id: '12151',
          sources: ['+SL'],
          version: 4,
        },
      ],
      version: 6,
    },
  })
})

it('should keep the shopping list previous item order when adding shopping list items to the cart', async () => {
  const productAlreadyInCart = cloneDeep(cartWithShoppingListDetail).lines[0]
  const productNotInCart = cloneDeep(cartWithShoppingListDetail).lines[1]

  productNotInCart.product.id = '15604'

  const cartCopy = cloneDeep(cartWithMilka)
  cartCopy.lines.push(productAlreadyInCart)
  cartCopy.lines.push(productNotInCart)

  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/cart/',
        responseBody: cartCopy,
      },
      {
        path: '/customers/1/cart/',
        method: 'PUT',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          version: 6,
          lines: [
            { quantity: 1, product_id: '52750', sources: ['+SL'] },
            { quantity: 1, product_id: '10672', sources: ['+SL'] },
            { quantity: 0.3, product_id: '24706', sources: ['+PL', '+SL'] },
            { quantity: 1, version: 4, product_id: '12151', sources: ['+SL'] },
            { quantity: 1, version: 4, product_id: '15604', sources: ['+PL'] },
          ],
        },
        responseBody: cartCopy,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  addListToCart()
  await screen.findByRole('dialog')

  expect('/customers/1/cart/').toHaveBeenFetchedWith({
    method: 'PUT',
    body: {
      id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
      lines: [
        {
          quantity: 1,
          product_id: '52750',
          sources: ['+SL'],
        },
        {
          quantity: 1,
          product_id: '10672',
          sources: ['+SL'],
        },
        {
          quantity: 0.3,
          product_id: '24706',
          sources: ['+PL', '+SL'],
        },
        {
          quantity: 1,
          product_id: '12151',
          sources: ['+SL'],
          version: 4,
        },
        { quantity: 1, version: 4, product_id: '15604', sources: ['+PL'] },
      ],
      version: 6,
    },
  })
})
