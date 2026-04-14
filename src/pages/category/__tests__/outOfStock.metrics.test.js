import { screen } from '@testing-library/react'

import { clickOnProductCell, getProductByDisplayName } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

it('should send the display metrics when an temporary unavailable product is displayed on the screen', async () => {
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

  expect(Tracker.sendViewChange).toHaveBeenCalledWith('out_of_stock_product', {
    id: '8731',
    source: 'categories',
    order: 0,
    layout: 'grid',
    cart_mode: 'purchase',
  })
})

it('should not send the display metrics for permanently unavailable products', async () => {
  const categoryDetailCopy = cloneDeep(categoryDetail)
  categoryDetailCopy.categories[0].products[0].published = false
  categoryDetailCopy.categories[0].products[0].status = null
  wrap(App)
    .atPath('/categories/112/')
    .withNetwork([
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetailCopy },
    ])
    .withLogin()
    .mount()

  await screen.findAllByText('Aceite, vinagre y sal')

  expect(Tracker.sendViewChange).not.toHaveBeenCalledWith(
    'out_of_stock_product',
    {
      id: '8731',
      source: 'categories',
      layout: 'grid',
      cart_mode: 'purchase',
    },
  )
})

it('should send the click metrics when an temporary unavailable product is clicked', async () => {
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
  clickOnProductCell(temporaryUnavailableProduct)

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'out_of_stock_product_click',
    {
      id: '8731',
      source: 'categories',
      order: 0,
      layout: 'grid',
      cart_mode: 'purchase',
    },
  )
})

it('should send the click metrics when an permanently unavailable product is clicked', async () => {
  const categoryDetailCopy = cloneDeep(categoryDetail)
  categoryDetailCopy.categories[0].products[0].published = false
  categoryDetailCopy.categories[0].products[0].status = null
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
  clickOnProductCell(temporaryUnavailableProduct)

  expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
    'out_of_stock_product_click',
    {
      id: '8731',
      source: 'categories',
      layout: 'grid',
      cart_mode: 'purchase',
    },
  )
})
