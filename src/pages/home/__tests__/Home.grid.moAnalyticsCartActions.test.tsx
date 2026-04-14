import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { cartWithSources } from 'app/cart/__scenarios__/cart'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { decreaseProduct } from 'pages/helpers'
import { knownFeatureFlags } from 'services/feature-flags'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

afterEach(() => {
  vi.clearAllMocks()
})

it('should call Tracker.sendInteraction with page, section, position and section_position for grid when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGrid }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const [productCell] = screen.getAllByTestId('product-cell')
  userEvent.click(within(productCell).getByText('Add to cart'))

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

it('should call Tracker.sendInteraction without page, section, position and section_position for grid when flag is OFF', async () => {
  activeFeatureFlags([])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGrid }])
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  const [productCell] = screen.getAllByTestId('product-cell')
  userEvent.click(within(productCell).getByText('Add to cart'))

  expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
    'add_product_click',
    expect.objectContaining({ page: expect.anything() }),
  )
})

it('should call Tracker.sendInteraction with enrichment for decrease_product_click in grid when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cartWithSources },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

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

it('should call Tracker.sendInteraction without enrichment for decrease_product_click in grid when flag is OFF', async () => {
  activeFeatureFlags([])

  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cartWithSources },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
  decreaseProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

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
