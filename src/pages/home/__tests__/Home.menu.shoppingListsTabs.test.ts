import { screen, within } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { knownFeatureFlags } from 'services/feature-flags/constants'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

afterEach(() => {
  vi.resetAllMocks()
  vi.clearAllMocks()
})

it('should link to /shopping-lists when SHOPPING_LISTS_TABS flag is OFF', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/customers/1/home/', responseBody: homeWithGrid }])
    .withLogin()
    .mount()

  await screen.findByText('Novedades')

  const navigation = screen.getByRole('navigation')
  expect(
    within(navigation).getByRole('link', { name: 'Lists' }),
  ).toHaveAttribute('href', '/shopping-lists')
})

it('should mark Lists header link as active when on /shopping-lists with flag OFF', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })

  const header = screen.getByRole('banner')
  const headerLink = within(header).getByRole('link', { name: 'Lists' })
  expect(headerLink).toHaveClass('active')
})

it('should mark Lists header link as active when on /shopping-lists with flag ON', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('navigation', { name: 'Shopping lists navigation' })

  const header = screen.getByRole('banner')
  const headerLink = within(header).getByRole('link', { name: 'Lists' })
  expect(headerLink).toHaveClass('active')
})

it('should link to /shopping-lists/my-regulars when SHOPPING_LISTS_TABS flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/customers/1/home/', responseBody: homeWithGrid }])
    .withLogin()
    .mount()

  await screen.findByText('Novedades')

  const navigation = screen.getByRole('navigation')
  expect(
    within(navigation).getByRole('link', { name: 'Lists' }),
  ).toHaveAttribute('href', '/shopping-lists/my-regulars')
})
