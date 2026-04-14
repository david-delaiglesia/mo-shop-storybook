import { screen } from '@testing-library/react'

import { navigateToShoppingLists } from './helpers'
import { shoppingLists } from './scenarios'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'

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

it('should not display my regulars when the shopping lists FF is active', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGrid }])
    .mount()

  await screen.findByRole('heading', { level: 1 })

  expect(
    screen.queryByRole('link', { name: 'My Essentials' }),
  ).not.toBeInTheDocument()
})

it('should redirect to the shopping lists page when the user clicks the tab', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/home/', responseBody: homeWithGrid },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1 })
  navigateToShoppingLists()

  expect(
    await screen.findByRole('heading', { level: 1, name: 'Lists' }),
  ).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith('shopping_lists_view', {
    lists_count: 2,
  })
})
