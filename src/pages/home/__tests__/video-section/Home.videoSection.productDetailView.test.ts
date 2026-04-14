import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { homeWithVideoSection } from 'app/catalog/__scenarios__/home'
import {
  productBaseDetail,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { knownFeatureFlags } from 'services/feature-flags/constants'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  //STRIKE 2 Mock Canvas globally
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
    () =>
      ({
        save: vi.fn(),
        restore: vi.fn(),
        translate: vi.fn(),
        scale: vi.fn(),
        drawImage: vi.fn(),
      }) as unknown as CanvasRenderingContext2D,
  )
  Object.defineProperty(HTMLMediaElement.prototype, 'muted', {
    set: () => {},
  })
})
afterEach(() => {
  history.push('/')
  localStorage.clear()
  Storage.clear()
  vi.clearAllMocks()
})

const responses = [
  { path: '/customers/1/home/', responseBody: homeWithVideoSection },
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
  activeFeatureFlags([
    knownFeatureFlags.WEB_VIDEO_SECTION,
    knownFeatureFlags.WEB_PRODUCT_DETAIL_VIEW_PAYLOAD,
  ])

  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

  const videoSectionCard = screen.getByTestId('video-section-product-card')
  userEvent.click(
    within(videoSectionCard).getByRole('button', {
      name: /Fideos orientales Yakisoba/,
    }),
  )

  await screen.findByRole('dialog')

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('product_detail_view', {
    product_id: '8731',
    merca_code: '8731',
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    source: 'summer-recipes',
    page: 'home',
    section: 'summer-recipes',
    position: 0,
    section_position: 0,
  })
})

it('should send product_detail_view without page context via sendViewChange when flag is OFF', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_VIDEO_SECTION])

  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

  const videoSectionCard = screen.getByTestId('video-section-product-card')
  userEvent.click(
    within(videoSectionCard).getByRole('button', {
      name: /Fideos orientales Yakisoba/,
    }),
  )

  await screen.findByRole('dialog')

  expect(Tracker.sendViewChange).toHaveBeenCalledWith('product_detail', {
    product_id: '8731',
    display_name: 'Fideos orientales Yakisoba sabor pollo Hacendado',
    source: 'summer-recipes',
  })
  expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
    'product_detail_view',
    expect.anything(),
  )
})
