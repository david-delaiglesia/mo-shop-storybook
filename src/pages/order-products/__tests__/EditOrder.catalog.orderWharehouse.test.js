import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import {
  productBaseDetail,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { order } from 'app/order/__scenarios__/orderDetail'
import { openProductDetailFromCartInEditOrder } from 'pages/helpers'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const cookies = {
  [import.meta.env.VITE_ACCEPTED_COOKIES]: {
    thirdParty: true,
    necessary: true,
    version: 1,
  },
  [import.meta.env.VITE_DELIVERY_COOKIE]: {
    postalCode: '28001',
    warehouse: 'mad1',
  },
  [import.meta.env.VITE_USER_INFO]: { language: 'en' },
}

configure({
  changeRoute: (route) => history.push(route),
})
beforeEach(() => {
  Cookie.get = (cookie) => cookies[cookie]
})

it('should load the cart product detail for the order warehouse', async () => {
  vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440)
  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork([
      { path: '/customers/1/orders/1235/', responseBody: order },
      { path: '/customers/1/orders/1235/cart/', responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
      { path: '/products/3317/', responseBody: productBaseDetail },
      {
        path: '/products/3317/xselling/',
        responseBody: productXSelling,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Aceite, especias y salsas')
  openProductDetailFromCartInEditOrder(
    'Uva blanca con semillas, Paquete, 200 Grams, 1,89€ per 200 Grams',
  )
  await screen.findByText('Related products')

  expect(global.fetch).toHaveBeenCalledWith(
    expect.objectContaining({
      url: expect.stringContaining(
        '/customers/1/orders/1235/products/3317/?lang=en&wh=vlc1',
      ),
      method: 'GET',
    }),
  )
})
