import { screen, within } from '@testing-library/react'

import { clickOnHighlightedBannerProductPrice } from '../helpers'
import { vi } from 'vitest'
import { wrap } from 'wrapito'

import { App } from 'app.jsx'
import { homeWithBannerProduct } from 'app/catalog/__scenarios__/home'
import {
  productBaseDetail,
  productXSelling,
} from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

it('should show the product page when the user clicks on the product price section inside the banner', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/customers/1/home/', responseBody: homeWithBannerProduct },
      { path: '/products/8731/', responseBody: { ...productBaseDetail } },
      {
        path: '/products/8731/xselling/',
        responseBody: productXSelling,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Lists')
  clickOnHighlightedBannerProductPrice()

  const detailDialog = await screen.findByRole('dialog')
  expect(
    within(detailDialog).getByRole('heading', { name: 'Related products' }),
  ).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'home_section_click',
    expect.objectContaining({
      id: productBaseDetail.id,
      title: productBaseDetail.display_name,
    }),
  )
})
