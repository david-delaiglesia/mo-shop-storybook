import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  closeSignInModal,
  openAccountDropdown,
  openSignInModal,
} from 'pages/helpers'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Search - login', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  it('should add authenticate user query params to search query params on open login', async () => {
    wrap(App).atPath('/search-results?query=jam').withNetwork().mount()

    await screen.findByText(/Showing/)
    openAccountDropdown()
    openSignInModal()
    await screen.findByText('Enter your email')

    expect(window.location.search).toBe('?query=jam&authenticate-user=')
  })

  it('should add ?authenticate-user query param to search and remove it without deleting search', async () => {
    wrap(App).atPath('/search-results?query=jam').withNetwork().mount()

    await screen.findByText(/Showing/)
    openAccountDropdown()
    openSignInModal()
    await screen.findByText('Enter your email')
    closeSignInModal()

    expect(window.location.search).toBe('?query=jam')
  })
})
