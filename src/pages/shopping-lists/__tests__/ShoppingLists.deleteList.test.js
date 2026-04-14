import { act, screen, within } from '@testing-library/react'

import {
  cancelListDeletion,
  clickIntoOptionsButton,
  clickOutside,
  closeModalWithEscapeKey,
  confirmErrorDialog,
  confirmListDeletion,
  deleteList,
} from './helpers'
import { shoppingListDetail, shoppingLists } from './scenarios'
import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
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

it('should display a confirmation dialog before deleting a shopping list', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  clickIntoOptionsButton()
  deleteList()

  const dialog = screen.getByRole('dialog', {
    name: 'Do you want to delete this list?',
  })
  expect(dialog).toBeInTheDocument()
  expect(
    within(dialog).getByText('Do you want to delete this list?'),
  ).toBeInTheDocument()
  expect(
    within(dialog).getByText(
      'You will lose all the products saved in this list.',
    ),
  ).toBeInTheDocument()
})

it('should allow to delete a shopping list', async () => {
  const initialValue = JSON.stringify({
    listsOrders: {
      '0191fa22-176e-7c35-811c-4eed128a7679': 'product_sorting_by_category',
    },
  })
  localStorage.setItem('MO-shopping_list_detail', initialValue)
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  clickIntoOptionsButton()
  deleteList()
  const dialog = screen.getByRole('dialog', {
    name: 'Do you want to delete this list?',
  })
  confirmListDeletion(dialog)
  await screen.findByRole('heading', { level: 1, name: 'Lists' })

  expect(
    '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
  ).toHaveBeenFetchedWith({
    method: 'DELETE',
    body: {},
  })
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'more_actions_shopping_list_button_click',
    {
      list_name: 'My second list',
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      products_count: 2,
    },
  )
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'delete_shopping_list_button_click',
    {
      list_name: 'My second list',
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      products_count: 2,
    },
  )
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'confirm_delete_shopping_list_button_click',
    {
      list_name: 'My second list',
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      products_count: 2,
    },
  )
})

it('should display an error dialog if the deletion fails', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        method: 'delete',
        requestBody: undefined,
        responseBody: undefined,
        status: 400,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  clickIntoOptionsButton()
  deleteList()
  const dialog = screen.getByRole('dialog', {
    name: 'Do you want to delete this list?',
  })
  confirmListDeletion(dialog)

  const errorDialog = await screen.findByRole('dialog', {
    name: 'Operation not performed.It was not possible to delete the list, please try again.',
  })
  expect(errorDialog).toBeInTheDocument()
  expect(
    within(errorDialog).getByText(
      'It was not possible to delete the list, please try again.',
    ),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('dialog', { name: 'Do you want to delete this list?' }),
  ).not.toBeInTheDocument()
  confirmErrorDialog(errorDialog)
  expect(
    screen.queryByRole('dialog', { name: 'Operation not performed.' }),
  ).not.toBeInTheDocument()
})

it('should allow to cancel a shopping list deletion', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  clickIntoOptionsButton()
  deleteList()
  const dialog = screen.getByRole('dialog', {
    name: 'Do you want to delete this list?',
  })
  cancelListDeletion(dialog)

  expect(
    screen.queryByRole('dialog', { name: 'Do you want to delete this list?' }),
  ).not.toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'cancel_delete_shopping_list_button_click',
    {
      list_name: 'My second list',
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      products_count: 2,
    },
  )
  expect(
    screen.queryByRole('button', { name: 'Delete list' }),
  ).not.toBeInTheDocument()
})

it('should allow to cancel a shopping list deletion using the escape key', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await act(async () => {
    await screen.findByRole('heading', { name: 'My second list', level: 1 })
    clickIntoOptionsButton()
    deleteList()
    closeModalWithEscapeKey()

    expect(
      screen.queryByRole('dialog', {
        name: 'Do you want to delete this list?',
      }),
    ).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'cancel_delete_shopping_list_button_click',
      {
        list_name: 'My second list',
        list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
        products_count: 2,
      },
    )
  })
  expect(
    screen.queryByRole('button', { name: 'Delete list' }),
  ).not.toBeInTheDocument()
})

it('should allow to close the delete list item when clicking outside the button', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await act(async () => {
    await screen.findByRole('heading', { name: 'My second list', level: 1 })
    clickIntoOptionsButton()
    clickOutside()

    expect(
      screen.queryByRole('button', { name: 'Delete list' }),
    ).not.toBeInTheDocument()
  })
})

it('should open the more actions button submenu when clicking on the more actions button text', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  clickIntoOptionsButton()

  expect(
    screen.getByRole('button', { name: 'Delete list' }),
  ).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'more_actions_shopping_list_button_click',
    {
      list_name: 'My second list',
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      products_count: 2,
    },
  )
})
