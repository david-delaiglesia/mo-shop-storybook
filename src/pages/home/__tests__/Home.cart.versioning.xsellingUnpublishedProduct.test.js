import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { emptyCart } from 'app/cart/__scenarios__/cart'
import {
  productBaseDetail,
  productXSelling,
  unpublishedProduct,
} from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { addProduct } from 'pages/helpers'
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

it('should be able to add a product from xselling (that was unpublished, the client data is outdated) to the cart', async () => {
  const publishedProduct = { ...unpublishedProduct, published: true }
  const responses = [
    { path: '/products/8731/', responseBody: productBaseDetail },
    {
      path: '/products/8731/xselling/',
      responseBody: {
        ...productXSelling,
        results: [publishedProduct],
      },
    },
    {
      path: '/customers/1/cart/',
      method: 'put',
      requestBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        lines: [{ quantity: 1, product_id: '73420', sources: ['+XS'] }],
      },
      responseBody: {
        id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
        version: 2,
        open_order_id: null,
        lines: [
          {
            quantity: 1.0,
            sources: ['+XS'],
            product: unpublishedProduct,
            version: 2,
          },
        ],
        summary: { total: '0.00' },
        products_count: 0,
      },
    },
    {
      path: '/customers/1/cart/',
      responseBody: emptyCart,
    },
  ]
  wrap(App).atPath('/product/8731').withNetwork(responses).withLogin().mount()

  await screen.findByText('Descripción Fideos orientales Yakisoba sabor pollo')
  addProduct(publishedProduct.display_name)
  await screen.findAllByText('Product not available')
})
