import { screen } from '@testing-library/react'

import { getProductCellByDisplayName, openProductDetail } from './helpers'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import {
  productBaseDetail,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { knownFeatureFlags } from 'services/feature-flags'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

afterEach(() => {
  vi.clearAllMocks()
})

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

it('should send product_detail_view with page context via sendInteraction when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_PRODUCT_DETAIL_VIEW_PAYLOAD])

  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const productCell = getProductCellByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  openProductDetail(
    productCell,
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  await screen.findByRole('dialog')

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('product_detail_view', {
    product_id: '8731',
    merca_code: '8731',
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    source: 'new_arrivals',
    page: 'home',
    section: 'new_arrivals',
    position: 0,
    section_position: 0,
  })
})

it('should send product_detail_view without page context via sendViewChange when flag is OFF', async () => {
  activeFeatureFlags([])

  wrap(App).atPath('/').withNetwork(responses).mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const productCell = getProductCellByDisplayName(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  openProductDetail(
    productCell,
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )
  await screen.findByRole('dialog')

  expect(Tracker.sendViewChange).toHaveBeenCalledWith('product_detail', {
    product_id: '8731',
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    source: 'new_arrivals',
  })
  expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
    'product_detail_view',
    expect.anything(),
  )
})
