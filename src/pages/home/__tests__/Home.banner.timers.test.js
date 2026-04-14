import { screen, waitFor } from '@testing-library/react'

import {
  seeNextBannerWithArrow,
  seeSecondBannerWithBottomControl,
} from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithMultipleBanners } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'

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

it('should scroll automatically when there are multiple banners', async () => {
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithMultipleBanners },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Para tu San Valentín')

  const bannerContainer = screen
    .getByText('Para tu San Valentín')
    .closest('.banner__wrapper')

  await waitFor(
    () => expect(bannerContainer).toHaveStyle('transform: translateX(-1272px)'),
    { timeout: 4000 },
  )

  waitFor(
    () => expect(bannerContainer).toHaveStyle('transform: translateX(0px)'),
    { timeout: 4000 },
  )
})

it('should scroll forward manually when there are multiple banners', async () => {
  vi.spyOn(window, 'setInterval')
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithMultipleBanners },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Para tu San Valentín')
  seeNextBannerWithArrow()

  const bannerContainer = screen
    .getByText('Para tu San Valentín')
    .closest('.banner__wrapper')
  expect(bannerContainer).toHaveStyle('transform: translateX(-1272px)')
  expect(window.setInterval).toHaveBeenCalled()
})

it('should scroll forward with the bottom controllers when there are multiple banners', async () => {
  vi.spyOn(window, 'setInterval')
  const responses = [
    { path: '/customers/1/home/', responseBody: homeWithMultipleBanners },
  ]
  wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

  await screen.findByText('Para tu San Valentín')
  seeSecondBannerWithBottomControl()

  const bannerContainer = screen
    .getByText('Para tu San Valentín')
    .closest('.banner__wrapper')
  expect(bannerContainer).toHaveStyle('transform: translateX(-1272px)')
  expect(window.setInterval).toHaveBeenCalled()
})
