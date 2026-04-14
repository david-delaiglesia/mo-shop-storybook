import { screen } from '@testing-library/react'

import {
  addProductToCart,
  getProductByDisplayName,
  getProductCellByDisplayName,
  openProductDetail,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { cartWithSources } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  productBaseDetail,
  productWithoutXSelling,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { addProductFromDetail, decreaseProductFromDetail } from 'pages/helpers'
import { knownFeatureFlags } from 'services/feature-flags'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

afterEach(() => {
  vi.clearAllMocks()
  Storage.clear()
  localStorage.clear()
})

const productDetailResponses = [
  {
    path: '/products/8731/?lang=es&wh=vlc1',
    responseBody: { ...productBaseDetail },
  },
  {
    path: '/products/8731/xselling/',
    responseBody: productWithoutXSelling,
  },
]

const openProductModal = async () => {
  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const productCell = getProductCellByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  openProductDetail(
    productCell,
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  await screen.findByRole('dialog')
}

it('should send add_product_click with page context from product detail modal when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_PRODUCT_DETAIL_VIEW_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/home/', responseBody: homeWithGrid },
      ...productDetailResponses,
    ])
    .mount()

  await openProductModal()
  await addProductFromDetail()

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'add_product_click',
    expect.objectContaining({
      page: 'home',
      section: 'new_arrivals',
      position: 0,
      section_position: 0,
    }),
  )
})

it('should send add_product_click without page context from product detail modal when flag is OFF', async () => {
  activeFeatureFlags([])

  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/home/', responseBody: homeWithGrid },
      ...productDetailResponses,
    ])
    .mount()

  await openProductModal()
  await addProductFromDetail()

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'add_product_click',
    expect.not.objectContaining({
      page: 'home',
      section: 'new_arrivals',
      position: 0,
      section_position: 0,
    }),
  )
})

it('should send decrease_product_click with page context from product detail modal when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_PRODUCT_DETAIL_VIEW_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cartWithSources },
      ...productDetailResponses,
    ])
    .withLogin()
    .mount()

  await openProductModal()
  decreaseProductFromDetail()

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'decrease_product_click',
    expect.objectContaining({
      page: 'home',
      section: 'new_arrivals',
      position: 0,
      section_position: 0,
    }),
  )
})

it('should send decrease_product_click without page context from product detail modal when flag is OFF', async () => {
  activeFeatureFlags([])

  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cartWithSources },
      ...productDetailResponses,
    ])
    .withLogin()
    .mount()

  await openProductModal()
  decreaseProductFromDetail()

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'decrease_product_click',
    expect.not.objectContaining({
      page: 'home',
      section: 'new_arrivals',
      position: 0,
      section_position: 0,
    }),
  )
})

it('should send add_product_click with page product-detail for xselling from home modal when flags are ON', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD,
    knownFeatureFlags.WEB_XSELLING_ADD_PRODUCT_CLICK_PAGE,
  ])

  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/?lang=es&wh=vlc1',
        responseBody: { ...productBaseDetail },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ])
    .mount()

  await openProductModal()

  const dialog = screen.getByRole('dialog')
  const xsellingProduct = getProductByDisplayName(dialog, 'Pera conferencia')
  addProductToCart(xsellingProduct)
  await screen.findAllByText('1 unit')

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'add_product_click',
    expect.objectContaining({
      source: 'xselling',
      page: 'product-detail',
      section: 'xselling',
      position: 0,
    }),
  )
})
