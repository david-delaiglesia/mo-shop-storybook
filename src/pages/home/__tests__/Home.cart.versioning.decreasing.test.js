import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { productBase, productWithBulk } from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { decreaseProduct, getProductCell } from 'pages/helpers'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')
vi.unmock('libs/debounce')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

afterEach(() => {
  vi.clearAllMocks()
  Storage.clear()
  localStorage.clear()
})

it('should decrease a product listening the backend response', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [{ product: productBase, version: 1, quantity: 2, sources: [] }],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [
          {
            quantity: 1,
            product_id: '8731',
            sources: ['-NA'],
          },
        ],
      },
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        lines: [{ product: productBase, quantity: 55, sources: [] }],
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  await screen.findAllByText('55 units')

  const productCell = getProductCell(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  expect(productCell).toHaveTextContent('55 units')
})

it('should decrease a product listening the backend response with a cart without version', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ product: productBase, version: 1, quantity: 2, sources: [] }],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 1, product_id: '8731', sources: ['-NA'] }],
      },
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [
          {
            product: productBase,
            version: 1,
            quantity: 55,
            sources: ['+NA'],
          },
        ],
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  await screen.findAllByText('55 units')

  const productCell = getProductCell(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  expect(productCell).toHaveTextContent('55 units')
})

it('should only listen to the last backend response decreasing products', async () => {
  const spy = vi.spyOn(Storage, 'setItem')

  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [{ product: productBase, version: 1, quantity: 3, sources: [] }],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      delay: 200,
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [{ quantity: 2, product_id: '8731', sources: ['-NA'] }],
      },
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        lines: [
          { product: productBase, version: 2, quantity: 5, sources: ['-NA'] },
        ],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [{ quantity: 1, product_id: '8731', sources: ['-NA', '-NA'] }],
      },
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 4,
        lines: [
          {
            product: productBase,
            version: 4,
            quantity: 1,
            sources: ['-NA', '-NA'],
          },
          {
            product: productWithBulk,
            version: 3,
            quantity: 1,
            sources: ['+NA'],
          },
        ],
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  await screen.findAllByText('1 kg')

  const productCell = getProductCell(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  expect(productCell).toHaveTextContent('1 unit')
  expect(spy).not.toHaveBeenCalledWith('cart', {
    id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
    version: 2,
    lines: [
      {
        id: undefined,
        quantity: 5,
        version: 2,
        product_id: '8731',
        sources: ['-NA'],
      },
    ],
  })
})
