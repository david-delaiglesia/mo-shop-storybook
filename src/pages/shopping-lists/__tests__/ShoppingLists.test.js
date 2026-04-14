import { act, screen, within } from '@testing-library/react'

import {
  cancelListCreation,
  clickOnCreateListButton,
  clickOnCreateNewListButton,
  closeModalWithEscapeKey,
  login,
  navigateToShoppingListDetail,
} from './helpers'
import { shoppingListDetail, shoppingLists } from './scenarios'
import { monitoring } from 'monitoring'
import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { useIsVisible } from 'hooks/useIsVisible'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const mockSetRef = vi.fn()

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  vi.mock('hooks/useIsVisible', () => ({
    useIsVisible: vi.fn(),
  }))

  useIsVisible.mockReturnValue({
    setElementObserved: mockSetRef,
    isVisible: true,
  })
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should display the empty placeholder for non logged users when accessing the list of lists page', async () => {
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
    screen.getByText(
      'Once you access your account, you will find all your lists here.',
    ),
  ).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument()
})

it('should allow to log in from the empty placeholder', async () => {
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
  login()

  expect(
    within(screen.getByRole('dialog')).getByText('Enter your email'),
  ).toBeInTheDocument()
})

it('should display the shopping lists items', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })

  expect(screen.getByText('My first list')).toBeInTheDocument()
  expect(screen.getByText('1 product')).toBeInTheDocument()
  expect(screen.getByText('My second list')).toBeInTheDocument()
  expect(screen.getByText('2 products')).toBeInTheDocument()
})

it('should allow to navigate to a shopping list detail', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      {
        path: '/customers/1/shopping-lists/550e8400-e29b-41d4-a716-446655440000/',
        responseBody: shoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })
  navigateToShoppingListDetail('My first list')

  expect(
    await screen.findByRole('button', { name: 'Options' }),
  ).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith('shopping_list_click', {
    list_name: 'My first list',
    list_id: '550e8400-e29b-41d4-a716-446655440000',
    products_count: 1,
    order: 0,
    cart_mode: 'purchase',
  })
})

it('should send the shopping list click tracking event', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      {
        path: '/customers/1/shopping-lists/e2a357db-d023-4967-85b0-2a84f3a15ee2/',
        responseBody: shoppingListDetail,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })
  navigateToShoppingListDetail('My second list')

  expect(
    await screen.findByRole('button', { name: 'Options' }),
  ).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith('shopping_list_click', {
    list_name: 'My second list',
    list_id: 'e2a357db-d023-4967-85b0-2a84f3a15ee2',
    products_count: 2,
    order: 1,
    cart_mode: 'purchase',
  })
})

it('should display my essentials as the first element of the list', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })

  expect(screen.getByText('My Essentials')).toBeInTheDocument()
  expect(screen.getByText('Based on your orders')).toBeInTheDocument()
})

it('should open a dialog with all the information needed to create a list', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })
  clickOnCreateNewListButton()

  expect(
    screen.getByRole('dialog', {
      name: 'Create list, Enter a name for your new list',
    }),
  ).toBeInTheDocument()
  expect(screen.getByText('Enter a name for your new list')).toBeInTheDocument()
  expect(screen.getByLabelText('Name of the list')).toHaveAttribute(
    'maxLength',
    '30',
  )
})

it('should allow to cancel the create list action', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })
  clickOnCreateNewListButton()
  cancelListCreation()

  expect(
    screen.queryByRole('dialog', { name: 'Create list' }),
  ).not.toBeInTheDocument()
})

it('should allow to cancel the create list action by pressing the escape key', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })

  act(() => {
    clickOnCreateNewListButton()
    closeModalWithEscapeKey()

    expect(
      screen.queryByRole('dialog', { name: 'Create list' }),
    ).not.toBeInTheDocument()
  })
})

describe('shopping lists images', () => {
  it('should display the image for my essentials', async () => {
    wrap(App)
      .atPath('/shopping-lists')
      .withNetwork([
        { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { level: 1, name: 'Lists' })

    const allTheLinksInTheScreen = screen.getAllByRole('link')
    const myEssentialsListItem = allTheLinksInTheScreen.find((element) => {
      return within(element).queryByText('My Essentials') !== null
    })

    const myEssentialsImage = within(myEssentialsListItem).getByRole('img')
    expect(myEssentialsImage).toBeInTheDocument()
    expect(myEssentialsImage).toHaveAttribute(
      'src',
      '/src/app/my-regulars/components/my-regulars-empty/assets/my-regulars-copy@2x.png',
    )
  })

  it('should display the empty placeholders for lists with no products', async () => {
    const shoppingListsCopy = cloneDeep(shoppingLists)
    shoppingListsCopy.shopping_lists[0].thumbnail_images = []
    shoppingListsCopy.shopping_lists[0].products_quantity = 0
    wrap(App)
      .atPath('/shopping-lists')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/',
          responseBody: shoppingListsCopy,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { level: 1, name: 'Lists' })
    const allTheLinksInTheScreen = screen.getAllByRole('link')
    const myFirstListItem = allTheLinksInTheScreen.find((element) => {
      return within(element).queryByText('My first list') !== null
    })

    const myFirstListItemImages = within(myFirstListItem).getAllByRole('img')
    expect(myFirstListItemImages.length).toBe(4)
    expect(myFirstListItemImages[0]).toHaveAttribute(
      'src',
      '/src/app/shopping-lists/components/shopping-list-item/EmptyPlaceholder.svg',
    )
    expect(myFirstListItemImages[0]).toHaveClass(
      'shopping-list-item__image-empty--position1',
    )
    expect(myFirstListItemImages[1]).toHaveAttribute(
      'src',
      '/src/app/shopping-lists/components/shopping-list-item/EmptyPlaceholder.svg',
    )
    expect(myFirstListItemImages[1]).toHaveClass(
      'shopping-list-item__image-empty--position2',
    )
    expect(myFirstListItemImages[2]).toHaveAttribute(
      'src',
      '/src/app/shopping-lists/components/shopping-list-item/EmptyPlaceholder.svg',
    )
    expect(myFirstListItemImages[2]).toHaveClass(
      'shopping-list-item__image-empty--position3',
    )
    expect(myFirstListItemImages[3]).toHaveAttribute(
      'src',
      '/src/app/shopping-lists/components/shopping-list-item/EmptyPlaceholder.svg',
    )
    expect(myFirstListItemImages[3]).toHaveClass(
      'shopping-list-item__image-empty--position4',
    )
  })

  it('should display the images for lists with four products', async () => {
    const shoppingListsCopy = cloneDeep(shoppingLists)
    shoppingListsCopy.shopping_lists[0].thumbnail_images.push(
      'https://sta-mercadona.imgix.net/images/6fe3bd1734dacc3f8751577ed526b7ab.jpg?fit=crop&h=300&w=300',
    )
    shoppingListsCopy.shopping_lists[0].thumbnail_images.push(
      'https://sta-mercadona.imgix.net/images/5fa8b3f8b45d41a01fc19622122fca72.jpg?fit=crop&h=300&w=300',
    )
    shoppingListsCopy.shopping_lists[0].thumbnail_images.push(
      'https://sta-mercadona.imgix.net/images/409a53c0327dff2c4b91e6b4c58efa42.jpg?fit=crop&h=300&w=300',
    )
    shoppingListsCopy.shopping_lists[0].products_quantity = 4
    wrap(App)
      .atPath('/shopping-lists')
      .withNetwork([
        {
          path: '/customers/1/shopping-lists/',
          responseBody: shoppingListsCopy,
        },
      ])
      .withLogin()
      .mount()

    await screen.findByRole('heading', { level: 1, name: 'Lists' })
    const allTheLinksInTheScreen = screen.getAllByRole('link')
    const myFirstListItem = allTheLinksInTheScreen.find((element) => {
      return within(element).queryByText('My first list') !== null
    })

    const myFirstListItemImages = within(myFirstListItem).getAllByRole('img')
    expect(myFirstListItemImages.length).toBe(4)
    expect(myFirstListItemImages[0]).toHaveAttribute(
      'src',
      'https://sta-mercadona.imgix.net/images/ed2f5303a6f0c6bac00c00f254f82fb5.jpg?fit=crop&h=300&w=300',
    )
    expect(myFirstListItemImages[0]).toHaveClass(
      'shopping-list-item__image--position1',
    )
    expect(myFirstListItemImages[1]).toHaveAttribute(
      'src',
      'https://sta-mercadona.imgix.net/images/6fe3bd1734dacc3f8751577ed526b7ab.jpg?fit=crop&h=300&w=300',
    )
    expect(myFirstListItemImages[1]).toHaveClass(
      'shopping-list-item__image--position2',
    )
    expect(myFirstListItemImages[2]).toHaveAttribute(
      'src',
      'https://sta-mercadona.imgix.net/images/5fa8b3f8b45d41a01fc19622122fca72.jpg?fit=crop&h=300&w=300',
    )
    expect(myFirstListItemImages[2]).toHaveClass(
      'shopping-list-item__image--position3',
    )
    expect(myFirstListItemImages[3]).toHaveAttribute(
      'src',
      'https://sta-mercadona.imgix.net/images/409a53c0327dff2c4b91e6b4c58efa42.jpg?fit=crop&h=300&w=300',
    )
    expect(myFirstListItemImages[3]).toHaveClass(
      'shopping-list-item__image--position4',
    )
  })
})

it('should display loader if the shopping lists items have not been loaded yet', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
        delay: 300,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })
  expect(screen.getByLabelText('cargando las listas')).toBeInTheDocument()
})

it('should not break the page if shopping list response is null', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/',
        responseBody: null,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })

  expect(
    screen.getByRole('heading', { level: 1, name: 'Lists' }),
  ).toBeInTheDocument()
  expect(monitoring.sendMessage).toHaveBeenCalledWith(
    'Shopping lists response doesn\'t have shoppingLists: "empty response"',
  )
})

it('should be able to create a list with the "Create List" button if "Create New List" button is not visible', async () => {
  useIsVisible.mockReturnValue({
    setElementObserved: mockSetRef,
    isVisible: false,
  })
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })

  clickOnCreateListButton()

  expect(
    screen.getByRole('dialog', {
      name: 'Create list, Enter a name for your new list',
    }),
  ).toBeInTheDocument()
})

it('should NOT display "Create List" button if "Create New List" button is visible', async () => {
  wrap(App)
    .atPath('/shopping-lists')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { level: 1, name: 'Lists' })

  const createListButton = screen.queryByRole('button', {
    name: 'Create list',
  })
  expect(createListButton).not.toBeInTheDocument()
})
