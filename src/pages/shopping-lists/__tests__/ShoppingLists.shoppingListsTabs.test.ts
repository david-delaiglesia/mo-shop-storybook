import { screen, within } from '@testing-library/react'

import { shoppingLists } from './scenarios'
import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
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

it('should not display tabs for anonymous users when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .mount()

  await screen.findByRole('heading', {
    level: 4,
    name: 'Sign in to see your lists',
  })

  expect(
    screen.queryByRole('navigation', { name: 'Shopping lists navigation' }),
  ).not.toBeInTheDocument()
})

it('should not display tabs when SHOPPING_LISTS_TABS flag is OFF', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })

  expect(
    screen.queryByRole('navigation', { name: 'Shopping lists navigation' }),
  ).not.toBeInTheDocument()
})

it('should mark Lists link as current page when on /shopping-lists', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  const nav = await screen.findByRole('navigation', {
    name: 'Shopping lists navigation',
  })

  expect(within(nav).getByRole('link', { name: 'Lists' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  expect(
    within(nav).getByRole('link', { name: 'My Essentials' }),
  ).not.toHaveAttribute('aria-current')
})

it('should not display My Essentials item when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('navigation', { name: 'Shopping lists navigation' })

  expect(screen.queryByText('Based on your orders')).not.toBeInTheDocument()
})

it('should render a navigation landmark with accessible label when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('navigation', { name: 'Shopping lists navigation' })
})

it('should display tabs when SHOPPING_LISTS_TABS flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  const nav = await screen.findByRole('navigation', {
    name: 'Shopping lists navigation',
  })

  expect(
    within(nav).getByRole('link', { name: 'My Essentials' }),
  ).toBeInTheDocument()
  expect(within(nav).getByRole('link', { name: 'Lists' })).toBeInTheDocument()
})

it('should display shopping lists content in the tab when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  const nav = await screen.findByRole('navigation', {
    name: 'Shopping lists navigation',
  })

  expect(within(nav).getByRole('link', { name: 'Lists' })).toHaveAttribute(
    'aria-current',
    'page',
  )
  expect(screen.getByText('My first list')).toBeInTheDocument()
  expect(screen.getByText('My second list')).toBeInTheDocument()
})
