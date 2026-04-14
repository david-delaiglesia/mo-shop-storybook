import { screen } from '@testing-library/react'

import {
  addProductToCartFromDetail,
  clickOnHighlightedBanner,
  getProductCellByDisplayName,
  openProductDetail,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { emptyLocalCart } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  productBaseDetail,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

const today = new Date().toISOString().split('T')[0]

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
  Storage.clear()
  localStorage.clear()
})

it('should send the correct section_home_type when adding a product from the detail of a carousel', async () => {
  Storage.setItem('cart', emptyLocalCart)
  const homeWithCarousel = structuredClone(homeWithGrid)
  homeWithCarousel.sections[1].layout = 'carousel'
  const responses = [
    { path: '/home/', responseBody: homeWithCarousel },
    {
      path: '/products/8731/?lang=es&wh=vlc1',
      responseBody: { ...productBaseDetail },
    },
    {
      path: '/products/8731/xselling/',
      responseBody: productXSelling,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const productToSeeDetail = getProductCellByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  openProductDetail(
    productToSeeDetail,
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  const productDetail = await screen.findByRole('dialog')

  addProductToCartFromDetail(productDetail)

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
    id: '8731',
    merca_code: '8731',
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    selling_method: 'units',
    amount: 0,
    price: '0,85',
    source: 'new_arrivals',
    first_product_added_at: expect.stringContaining(today),
    cart_id: '10000000-1000-4000-8000-100000000000',
    layout: 'product_detail',
    requires_age_check: false,
    cart_mode: 'purchase',
    added_amount: 1,
    first_product: true,
  })
})

it('should send the correct section_home_type when adding a product from the detail of a highlighted', async () => {
  Storage.setItem('cart', emptyLocalCart)
  const homeWithHighlighted = structuredClone(homeWithGrid)
  homeWithHighlighted.sections[1].layout = 'highlighted'
  const responses = [
    { path: '/home/', responseBody: homeWithHighlighted },
    {
      path: '/products/8731/?lang=es&wh=vlc1',
      responseBody: { ...productBaseDetail },
    },
    {
      path: '/products/8731/xselling/',
      responseBody: productXSelling,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

  clickOnHighlightedBanner()

  const productDetail = await screen.findByRole('dialog')

  addProductToCartFromDetail(productDetail)

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
    id: '8731',
    merca_code: '8731',
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    selling_method: 'units',
    amount: 0,
    price: '0,85',
    source: 'new_arrivals',
    first_product_added_at: expect.stringContaining(today),
    cart_id: '10000000-1000-4000-8000-100000000000',
    layout: 'product_detail',
    requires_age_check: false,
    cart_mode: 'purchase',
    added_amount: 1,
    first_product: true,
  })
})

it('should not send the section_home_type when adding a product from the detail of a grid', async () => {
  Storage.setItem('cart', emptyLocalCart)
  const responses = [
    { path: '/home/', responseBody: homeWithGrid },
    {
      path: '/products/8731/?lang=es&wh=vlc1',
      responseBody: { ...productBaseDetail },
    },
    {
      path: '/products/8731/xselling/',
      responseBody: productXSelling,
    },
  ]
  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const productToSeeDetail = getProductCellByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  openProductDetail(
    productToSeeDetail,
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  const productDetail = await screen.findByRole('dialog')

  addProductToCartFromDetail(productDetail)

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
    id: '8731',
    merca_code: '8731',
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    selling_method: 'units',
    amount: 0,
    price: '0,85',
    source: 'new_arrivals',
    first_product_added_at: expect.stringContaining(today),
    cart_id: '10000000-1000-4000-8000-100000000000',
    layout: 'product_detail',
    requires_age_check: false,
    cart_mode: 'purchase',
    added_amount: 1,
    first_product: true,
  })
})

it('should send campaign ID to add_product_click event when opening a product detail from a campaign URL', async () => {
  Storage.setItem('cart', emptyLocalCart)
  const homeWithCarousel = structuredClone(homeWithGrid)
  homeWithCarousel.sections[1].layout = 'carousel'
  const responses = [
    { path: '/home/', responseBody: homeWithCarousel },
    {
      path: '/products/8731/?lang=es&wh=vlc1',
      responseBody: { ...productBaseDetail },
    },
    {
      path: '/products/8731/xselling/',
      responseBody: productXSelling,
    },
  ]
  wrap(App).atPath('/?campaign=verano').withNetwork(responses).mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const productToSeeDetail = getProductCellByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  openProductDetail(
    productToSeeDetail,
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  const productDetail = await screen.findByRole('dialog')

  addProductToCartFromDetail(productDetail)

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('add_product_click', {
    id: '8731',
    merca_code: '8731',
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    selling_method: 'units',
    amount: 0,
    price: '0,85',
    source: 'new_arrivals',
    first_product_added_at: expect.stringContaining(today),
    cart_id: '10000000-1000-4000-8000-100000000000',
    layout: 'product_detail',
    requires_age_check: false,
    cart_mode: 'purchase',
    added_amount: 1,
    first_product: true,
    campaign: 'verano',
  })
})
