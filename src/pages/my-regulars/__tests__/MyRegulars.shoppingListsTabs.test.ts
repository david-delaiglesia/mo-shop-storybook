import { screen, within } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { activeFeatureFlags } from '__tests__/helpers'
import { App, history } from 'app'
import { recommendations } from 'app/catalog/__scenarios__/recommendations'
import { knownFeatureFlags } from 'services/feature-flags/constants'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

afterEach(() => {
  vi.resetAllMocks()
  vi.clearAllMocks()
  Storage.clear()
  localStorage.clear()
})

it('should not display tabs for anonymous users when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists/my-regulars')
    .withNetwork([
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ])
    .mount()

  await screen.findByRole('button', { name: 'Login' })

  expect(
    screen.queryByRole('navigation', { name: 'Shopping lists navigation' }),
  ).not.toBeInTheDocument()
})

it('should not display tabs when SHOPPING_LISTS_TABS flag is OFF', async () => {
  wrap(App)
    .atPath('/shopping-lists/my-regulars')
    .withNetwork([
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

  expect(
    screen.queryByRole('navigation', { name: 'Shopping lists navigation' }),
  ).not.toBeInTheDocument()
})

it('should display my regulars products in the tab when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists/my-regulars')
    .withNetwork([
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('navigation', { name: 'Shopping lists navigation' })

  expect(
    screen.getByText('Fideos orientales Yakisoba sabor pollo Hacendado'),
  ).toBeInTheDocument()
})

//TODO: remove test when remove SHOPPING_LISTS_TABS FF
it('should hide my regulars header subtitle when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists/my-regulars')
    .withNetwork([
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'My Essentials' })

  expect(
    screen.queryByText(
      'Here you can see the products and quantities you usually buy to save you time.',
    ),
  ).not.toBeInTheDocument()
})

it('should mark My Essentials link as current page when on /shopping-lists/my-regulars', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists/my-regulars')
    .withNetwork([
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ])
    .withLogin()
    .mount()

  const nav = await screen.findByRole('navigation', {
    name: 'Shopping lists navigation',
  })

  expect(
    within(nav).getByRole('link', { name: 'My Essentials' }),
  ).toHaveAttribute('aria-current', 'page')
  expect(within(nav).getByRole('link', { name: 'Lists' })).not.toHaveAttribute(
    'aria-current',
  )
})

it('should render a navigation landmark with accessible label when flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists/my-regulars')
    .withNetwork([
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('navigation', { name: 'Shopping lists navigation' })
})

it('should display tabs when SHOPPING_LISTS_TABS flag is ON', async () => {
  activeFeatureFlags([knownFeatureFlags.SHOPPING_LISTS_TABS])
  wrap(App)
    .atPath('/shopping-lists/my-regulars')
    .withNetwork([
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
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
