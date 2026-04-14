import { screen } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithHighlightedGroup } from 'app/catalog/__scenarios__/home'
import { knownFeatureFlags } from 'services/feature-flags'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

afterEach(() => {
  vi.clearAllMocks()
})

it('should call Tracker.sendInteraction without page, section, position and section_position for highlighted group when flag is OFF', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_HIGHLIGHTED_GROUP])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithHighlightedGroup }])
    .mount()

  await screen.findByText('Dos productos destacados')
  const [firstAddToCart] = screen.getAllByText('Add to cart')
  userEvent.click(firstAddToCart)

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'add_product_click',
    expect.not.objectContaining({
      page: 'home',
      section: 'vlc1-mad1-dos-productos-destacados',
      position: 0,
      section_position: 0,
    }),
  )
})

it('should call Tracker.sendInteraction with correct position for subsequent items in highlighted group when flag is ON', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_HIGHLIGHTED_GROUP,
    knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD,
  ])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithHighlightedGroup }])
    .mount()

  await screen.findByText('Dos productos destacados')
  const addToCartButtons = screen.getAllByText('Add to cart')
  userEvent.click(addToCartButtons[1])

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'add_product_click',
    expect.objectContaining({
      page: 'home',
      section: 'vlc1-mad1-dos-productos-destacados',
      position: 1,
      section_position: 0,
    }),
  )
})

it('should call Tracker.sendInteraction with page, section, position and section_position for the first item in highlighted group when flag is ON', async () => {
  activeFeatureFlags([
    knownFeatureFlags.WEB_HIGHLIGHTED_GROUP,
    knownFeatureFlags.WEB_ADD_PRODUCT_CLICK_PAYLOAD,
  ])

  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithHighlightedGroup }])
    .mount()

  await screen.findByText('Dos productos destacados')
  const [firstAddToCart] = screen.getAllByText('Add to cart')
  userEvent.click(firstAddToCart)

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'add_product_click',
    expect.objectContaining({
      page: 'home',
      section: 'vlc1-mad1-dos-productos-destacados',
      position: 0,
      section_position: 0,
    }),
  )
})
