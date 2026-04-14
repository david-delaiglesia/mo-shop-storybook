import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { season } from 'app/catalog/__scenarios__/seasons'
import { openAccountDropdown, openSignInModal } from 'pages/helpers'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  Cookie.get = vi.fn(() => ({ language: 'en', postalCode: '46010' }))
})

afterEach(() => {
  sessionStorage.clear()
  Tracker.sendViewChange.mockClear()
  Tracker.sendInteraction.mockClear()
})

it('should open the login modal', async () => {
  const responses = [
    {
      path: '/home/seasons/31/?lang=en&wh=vlc1',
      responseBody: season,
    },
  ]
  wrap(App).atPath('/home/seasons/31').withNetwork(responses).mount()

  await screen.findByText('Sign in')

  openAccountDropdown()
  screen.getByText('Guest')
  screen.getByText('Help')

  openSignInModal()
  const loginModal = await screen.findByRole('dialog')

  expect(loginModal).toHaveTextContent('Enter your email')
  expect(window.location.search).toBe('?authenticate-user=')
})
