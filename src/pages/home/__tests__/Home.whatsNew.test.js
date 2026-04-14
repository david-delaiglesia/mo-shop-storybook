import { screen, within } from '@testing-library/react'

import { acceptDialog, navigateToShoppingLists } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'
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
  Storage.clear()
  localStorage.clear()
})

it('should display the whats new dialog', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/tooltips/shopping-lists-whats-new/',
        responseBody: {
          show_tooltip: true,
        },
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', {
    level: 1,
    name: 'Mercadona online shopping',
  })

  const whatsNewDialog = screen.getByRole('dialog', {
    name: 'Lists now available!',
  })
  expect(whatsNewDialog).toBeInTheDocument()
  expect(
    within(whatsNewDialog).getByText('Lists now available!'),
  ).toBeInTheDocument()
  expect(
    within(whatsNewDialog).getByText('Organise things just the way you like'),
  ).toBeInTheDocument()
  expect(
    within(whatsNewDialog).getByText(
      'Create your lists of favourites, recipes, essentials and more.',
    ),
  ).toBeInTheDocument()
  expect(
    within(whatsNewDialog).getByText('Do your shopping in record time'),
  ).toBeInTheDocument()
  expect(
    within(whatsNewDialog).getByText(
      'Add all the products and quantities that you normally buy with just a click.',
    ),
  ).toBeInTheDocument()
  expect(
    within(whatsNewDialog).getByText('Personalised suggestions'),
  ).toBeInTheDocument()
  expect(
    within(whatsNewDialog).getByText(
      'Discover recommended products for your list.',
    ),
  ).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'sl_whats_new_modal_view',
  )
})

it('should not display the whats new dialog if the backend responds with a false', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/tooltips/shopping-lists-whats-new/',
        responseBody: {
          show_tooltip: false,
        },
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', {
    level: 1,
    name: 'Mercadona online shopping',
  })

  expect(
    screen.queryByRole('dialog', { name: 'Lists now available!' }),
  ).not.toBeInTheDocument()
  expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
    'sl_whats_new_modal_view',
  )
})

it('should allow to navigate to the shopping list page from the whats new dialog', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/tooltips/shopping-lists-whats-new/',
        responseBody: {
          show_tooltip: true,
        },
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', {
    level: 1,
    name: 'Mercadona online shopping',
  })

  navigateToShoppingLists()

  expect(await screen.findByText('My first list')).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'sl_whats_new_modal_click',
    { option: 'go_to_lists' },
  )
})

it('should allow to accept the dialog and stay in the home page', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([
      { path: '/home/', responseBody: homeWithGrid },
      {
        path: '/customers/1/tooltips/shopping-lists-whats-new/',
        responseBody: {
          show_tooltip: true,
        },
      },
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', {
    level: 1,
    name: 'Mercadona online shopping',
  })

  acceptDialog()

  expect(
    screen.queryByRole('dialog', { name: 'Lists now available!' }),
  ).not.toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'sl_whats_new_modal_click',
    { option: 'understood' },
  )
})

it('should not make the request to the whats new endpoint for non logged in users', async () => {
  wrap(App)
    .atPath('/')
    .withNetwork([{ path: '/home/', responseBody: homeWithGrid }])
    .mount()

  await screen.findByRole('heading', {
    level: 1,
    name: 'Mercadona online shopping',
  })

  expect(
    '/customers/undefined/tooltips/shopping-lists-whats-new/',
  ).not.toHaveBeenFetched()
})
