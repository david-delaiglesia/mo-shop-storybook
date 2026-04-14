import { screen } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithBannerProduct } from 'app/catalog/__scenarios__/home'
import { knownFeatureFlags } from 'services/feature-flags'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

afterEach(() => {
  vi.clearAllMocks()
})

it('should call Tracker.sendInteraction without page, section, position and section_position for highlighted when flag is OFF', async () => {
  activeFeatureFlags([])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithBannerProduct }])
    .mount()

  await screen.findByText('Es tendencia')
  userEvent.click(screen.getByText('Add to cart'))

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'add_product_click',
    expect.not.objectContaining({
      page: 'home',
      section: 'producto-destacado',
      position: 0,
      section_position: 0,
    }),
  )
})

it('should call Tracker.sendInteraction with page, section, position and section_position for highlighted when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithBannerProduct }])
    .mount()

  await screen.findByText('Es tendencia')
  userEvent.click(screen.getByText('Add to cart'))

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'add_product_click',
    expect.objectContaining({
      page: 'home',
      section: 'producto-destacado',
      position: 0,
      section_position: 0,
    }),
  )
})

it('should call Tracker.sendInteraction with enrichment for decrease_product_click for highlighted when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithBannerProduct }])
    .mount()

  await screen.findByText('Es tendencia')
  userEvent.click(screen.getByText('Add to cart'))
  userEvent.click(screen.getAllByLabelText('Remove product from cart')[0])

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'decrease_product_click',
    expect.objectContaining({
      page: 'home',
      section: 'producto-destacado',
      position: 0,
      section_position: 0,
    }),
  )
})

it('should call Tracker.sendInteraction without enrichment for decrease_product_click for highlighted when flag is OFF', async () => {
  activeFeatureFlags([])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithBannerProduct }])
    .mount()

  await screen.findByText('Es tendencia')
  userEvent.click(screen.getByText('Add to cart'))
  userEvent.click(screen.getAllByLabelText('Remove product from cart')[0])

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'decrease_product_click',
    expect.not.objectContaining({
      page: 'home',
      section: 'producto-destacado',
      position: 0,
      section_position: 0,
    }),
  )
})
