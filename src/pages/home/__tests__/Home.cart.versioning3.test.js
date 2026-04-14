import { screen, waitFor } from '@testing-library/react'

import { monitoring } from 'monitoring'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  cartWithUnpublishedProduct,
  localCartWithUnpublishedProduct,
} from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  productBase,
  productWithBulk,
  unpublishedProduct,
} from 'app/catalog/__scenarios__/product'
import { similarProduct, similars } from 'app/catalog/__scenarios__/similars'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import {
  addProduct,
  confirmSimilarProductSubstitution,
  decreaseProduct,
  getProductCell,
  getProductCellFromCart,
  increaseProduct,
  removeProduct,
  removeProductFromCart,
  viewSimilarProductsFromCart,
} from 'pages/helpers'
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

it('should substitute an unpublished product listening the backend response', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      responseBody: cartWithUnpublishedProduct,
    },
    { path: '/products/73420/similars/', responseBody: similars },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          {
            product_id: '26107',
            quantity: 1,
            sources: ['+SC'],
          },
        ],
      },
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ product: similarProduct, quantity: 55, sources: [] }],
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Cart')
  viewSimilarProductsFromCart(
    'Laca de uñas 1 capa y listo Deliplus 891 mostaza',
  )
  await screen.findByRole('dialog')
  addProduct('Fabada Hacendado')
  confirmSimilarProductSubstitution()
  await screen.findAllByText('55 units')

  const productCell = getProductCellFromCart('Fabada Hacendado')
  expect(productCell).toHaveTextContent('55 units')
})

it('should remove a product listening the backend response', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '10000000-1000-4000-8000-100000000000',
        lines: [],
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
  addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  removeProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  await screen.findAllByText('55 units')

  const productCell = getProductCell(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  expect(productCell).toHaveTextContent('55 units')
})

it('should remove the line version after increasing the line', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [
          { version: 1, product: productBase, quantity: 1, sources: [] },
          { version: 1, product: productWithBulk, quantity: 1, sources: [] },
        ],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [
          { quantity: 2, product_id: '8731', sources: ['+NA'] },
          { version: 1, quantity: 1, product_id: '3317', sources: [] },
        ],
      },
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        lines: [
          { version: 2, product: productBase, quantity: 2, sources: [] },
          { version: 2, product: productWithBulk, quantity: 1, sources: [] },
        ],
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  increaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  await screen.findAllByText('2 units')

  await waitFor(() =>
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [
          { quantity: 2, product_id: '8731', sources: ['+NA'] },
          { version: 1, quantity: 1, product_id: '3317', sources: [] },
        ],
      },
    }),
  )
  const productCell = getProductCell(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  expect(productCell).toHaveTextContent('2 units')
})

it('should remove the line version after decreasing the line', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [
          { version: 1, product: productBase, quantity: 2, sources: [] },
          { version: 1, product: productWithBulk, quantity: 1, sources: [] },
        ],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [
          { quantity: 1, product_id: '8731', sources: ['-NA'] },
          { version: 1, quantity: 1, product_id: '3317', sources: [] },
        ],
      },
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        lines: [
          { version: 2, product: productBase, quantity: 1, sources: ['-NA'] },
          { version: 2, product: productWithBulk, quantity: 1, sources: [] },
        ],
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  await screen.findAllByText('1 unit')

  await waitFor(() =>
    expect('/customers/1/cart/').toHaveBeenFetchedWith({
      method: 'PUT',
      body: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [
          { quantity: 1, product_id: '8731', sources: ['-NA'] },
          { version: 1, quantity: 1, product_id: '3317', sources: [] },
        ],
      },
    }),
  )
  const productCell = getProductCell(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  expect(productCell).toHaveTextContent('1 unit')
})

it('should add a product and not listen the cart response if the cart has a previous version', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        lines: [{ product: productBase, version: 1, quantity: 1, sources: [] }],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        lines: [{ quantity: 2, product_id: '8731', sources: ['+NA'] }],
      },
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [
          { product: productBase, version: 1, quantity: 55, sources: [] },
        ],
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  increaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  await screen.findAllByText('2 units')

  const productCell = getProductCell(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  expect(productCell).toHaveTextContent('2 units')
})

it('should decrease a product and not listen the cart response if the cart has a previous version', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        lines: [{ product: productBase, version: 1, quantity: 2, sources: [] }],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        lines: [{ quantity: 1, product_id: '8731', sources: ['-NA'] }],
      },
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [
          { product: productBase, version: 1, quantity: 55, sources: [] },
        ],
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  await screen.findAllByText('1 unit')

  const productCell = getProductCell(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  expect(productCell).toHaveTextContent('1 unit')
})

it('should add a product and listen the cart response if the cart has a previous version and different id', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        lines: [{ product: productBase, version: 1, quantity: 1, sources: [] }],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        lines: [{ quantity: 2, product_id: '8731', sources: ['+NA'] }],
      },
      responseBody: {
        id: 'different-uuid',
        version: 1,
        lines: [
          { product: productBase, version: 1, quantity: 55, sources: [] },
        ],
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  increaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  await screen.findAllByText('55 units')

  const productCell = getProductCell(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  expect(productCell).toHaveTextContent('55 units')
})

it('should decrease a product and listen the cart response if the cart has a previous version and different id', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        lines: [{ product: productBase, version: 1, quantity: 2, sources: [] }],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        lines: [{ quantity: 1, product_id: '8731', sources: ['-NA'] }],
      },
      responseBody: {
        id: 'different-uuid',
        version: 1,
        lines: [
          { product: productBase, version: 1, quantity: 55, sources: [] },
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

it('should be able remove a unpublished product when the user is unlogged', async () => {
  Storage.setItem('cart', localCartWithUnpublishedProduct)
  const responses = [
    { path: '/home/', responseBody: homeWithGrid },
    {
      path: '/carts/',
      method: 'post',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ product_id: '73420', quantity: 1, sources: ['+RO'] }],
      },
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [
          {
            product: unpublishedProduct,
            quantity: 1,
            sources: ['+RO'],
            version: null,
          },
        ],
      },
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Novedades')
  removeProductFromCart('Laca de uñas 1 capa y listo Deliplus 891 mostaza')

  await screen.findByText('You have not yet added any products to your cart')

  expect(
    screen.getByText('You have not yet added any products to your cart'),
  ).toBeInTheDocument()
})

it('should send a log when the cart request fails increasing a product', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithGrid },
    {
      path: '/customers/1/cart/',
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [{ product: productBase, version: 1, quantity: 1, sources: [] }],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 1,
        lines: [{ quantity: 2, product_id: '8731', sources: ['+NA'] }],
      },
      status: 502,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  increaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  await screen.findAllByText('2 units')

  await waitFor(() =>
    expect(monitoring.sendMessage).toHaveBeenCalledWith(
      'Failed to update the cart',
    ),
  )
})

it('should send a log when the cart request fails decreasing a product', async () => {
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
        lines: [{ quantity: 1, product_id: '8731', sources: ['-NA'] }],
      },
      status: 502,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Novedades')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
  await screen.findAllByText('1 unit')

  await waitFor(() =>
    expect(monitoring.sendMessage).toHaveBeenCalledWith(
      'Failed to update the cart',
    ),
  )
})
