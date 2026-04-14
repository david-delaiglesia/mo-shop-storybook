import { screen } from '@testing-library/react'

import { MOAnalytics } from '..'
import { wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import {
  confirmLogoutAlert,
  logout,
} from 'pages/authenticate-user/__tests__/helpers'
import { openUserMenu } from 'pages/home/__tests__/helpers'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Events UserId property', () => {
  it('should set the userId when logging in and removing it when logging out', async () => {
    activeFeatureFlags(['web-custom-event-implementation'])

    vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')

    expect(MOAnalytics._userId).toBe('1')

    openUserMenu('John')
    logout()
    confirmLogoutAlert()

    expect(MOAnalytics._userId).toBe(undefined)
  })
})
