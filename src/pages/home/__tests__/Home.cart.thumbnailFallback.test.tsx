import { fireEvent, screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { cart } from 'app/cart/__scenarios__/cart'
import {
  cartApiResponseWithUnpublished,
  unPublishedProduct,
} from 'app/cart/__tests__/cart.mock'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { productBase } from 'app/catalog/__scenarios__/product'
import { openCart } from 'pages/home/__tests__/helpers'
import { knownFeatureFlags } from 'services/feature-flags'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should show unavailable placeholder when thumbnail fails to load and flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_CART_PRODUCT_THUMBNAIL_FALLBACK])

  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cart },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Estimated cost')
  openCart()
  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado', {
    selector: 'label',
  })

  const [cartCell] = screen.getAllByTestId('cart-product-cell')
  const img = cartCell.querySelector('img') as HTMLImageElement

  fireEvent.error(img)

  expect(img.src).toContain('unavailable')
})

it('should not change image src when thumbnail fails to load and flag is OFF', async () => {
  activeFeatureFlags([])

  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      { path: '/customers/1/cart/', responseBody: cart },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Estimated cost')
  openCart()
  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado', {
    selector: 'label',
  })

  const [cartCell] = screen.getAllByTestId('cart-product-cell')
  const img = cartCell.querySelector('img') as HTMLImageElement

  fireEvent.error(img)

  expect(img).toHaveAttribute('src', productBase.thumbnail)
})

it('should show unavailable placeholder when unpublished product thumbnail fails to load and flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.WEB_CART_PRODUCT_THUMBNAIL_FALLBACK])

  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Estimated cost')
  openCart()
  const img = (await screen.findByRole('img', {
    name: unPublishedProduct.display_name,
  })) as HTMLImageElement

  fireEvent.error(img)

  expect(img.src).toContain('unavailable')
})

it('should not change image src when unpublished product thumbnail fails to load and flag is OFF', async () => {
  activeFeatureFlags([])

  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/cart/',
        responseBody: cartApiResponseWithUnpublished,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Estimated cost')
  openCart()
  const img = await screen.findByRole('img', {
    name: unPublishedProduct.display_name,
  })

  fireEvent.error(img)

  expect(img).toHaveAttribute('src', unPublishedProduct.thumbnail)
})
