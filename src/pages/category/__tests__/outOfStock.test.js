import { screen, within } from '@testing-library/react'

import { getProductByDisplayName } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { orderCart } from 'app/order/__scenarios__/orderCart'
import { order } from 'app/order/__scenarios__/orderDetail'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

it('should display the product as out of stock for UNPUBLISHED temporary unavailable products', async () => {
  const categoryDetailCopy = cloneDeep(categoryDetail)
  categoryDetailCopy.categories[0].products[0].published = false
  categoryDetailCopy.categories[0].products[0].status =
    'temporarily_unavailable'
  wrap(App)
    .atPath('/categories/112/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetailCopy },
    ])
    .withLogin()
    .mount()

  await screen.findAllByText('Aceite, vinagre y sal')

  const temporaryUnavailableProduct = getProductByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  expect(
    within(temporaryUnavailableProduct).getByText('Temporarily out of stock'),
  ).toBeInTheDocument()
  expect(
    within(temporaryUnavailableProduct).queryByText('View alternatives'),
  ).not.toBeInTheDocument()
  expect(
    within(temporaryUnavailableProduct).queryByText('Product not available'),
  ).not.toBeInTheDocument()
  expect(temporaryUnavailableProduct).not.toHaveClass(
    'product-cell--actionable',
  )
})

it('should display the product as out of stock for PUBLISHED temporary unavailable products', async () => {
  const categoryDetailCopy = cloneDeep(categoryDetail)
  categoryDetailCopy.categories[0].products[0].published = true
  categoryDetailCopy.categories[0].products[0].status =
    'temporarily_unavailable'
  wrap(App)
    .atPath('/categories/112/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetailCopy },
    ])
    .withLogin()
    .mount()

  await screen.findAllByText('Aceite, vinagre y sal')

  const temporaryUnavailableProduct = getProductByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  expect(
    within(temporaryUnavailableProduct).getByText('Temporarily out of stock'),
  ).toBeInTheDocument()
  expect(
    within(temporaryUnavailableProduct).queryByText('View alternatives'),
  ).not.toBeInTheDocument()
  expect(
    within(temporaryUnavailableProduct).queryByText('Product not available'),
  ).not.toBeInTheDocument()
  expect(temporaryUnavailableProduct).not.toHaveClass(
    'product-cell--actionable',
  )
})

it('should not display the products as out of stock in the edit order categories section', async () => {
  wrap(App)
    .atPath('/orders/1235/edit/products')
    .withNetwork([
      { path: `/customers/1/orders/1235/`, responseBody: order },
      { path: `/customers/1/orders/1235/cart/`, responseBody: orderCart },
      { path: '/categories/', responseBody: categories },
      {
        path: '/categories/112/?lang=en&wh=vlc1&display_temporarily_unavailable=false',
        responseBody: categoryDetail,
        catchParams: true,
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  expect(await screen.findByText('Aceite, vinagre y sal')).toBeInTheDocument()
})
