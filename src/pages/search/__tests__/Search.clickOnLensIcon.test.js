import { screen } from '@testing-library/react'

import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { clickOnLensIcon } from 'pages/search/__tests__/helpers.js'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'

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
})

it('should put the focus on the search input when clicking the lens icon', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })

  expect(screen.getByTestId('search-input')).not.toHaveFocus()

  clickOnLensIcon()

  expect(
    screen.getByRole('heading', { level: 1, name: 'Lists' }),
  ).toBeInTheDocument()
  expect(screen.getByTestId('search-input')).toHaveFocus()
})
