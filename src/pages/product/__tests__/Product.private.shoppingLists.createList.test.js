import { act, screen, within } from '@testing-library/react'

import { addProductToList, addProductToNewList } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  productBaseDetail,
  productWithoutXSelling,
} from 'app/catalog/__scenarios__/product'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import {
  cancelListCreation,
  closeErrorDialog,
  confirmListCreation,
  introduceListName,
} from 'pages/shopping-lists/__tests__/helpers'
import { productShoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
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
  vi.useFakeTimers()
})

afterEach(() => {
  vi.clearAllMocks()
  vi.useRealTimers()
  Storage.clear()
  localStorage.clear()
})

it('should display the introduce list name modal when adding a product to a new list.', async () => {
  wrap(App)
    .atPath('/product/8731')
    .withNetwork([
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
      {
        path: '/customers/1/shopping-lists/products/8731/shopping-lists-with-product-checks/',
        responseBody: productShoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Descripción Fideos orientales Yakisoba sabor pollo')
  addProductToList()
  const dialog = await screen.findByRole('dialog', { name: 'Save in a list' })
  addProductToNewList(dialog)

  expect(
    screen.getByRole('dialog', {
      name: 'Create list, Enter a name for your new list',
    }),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('dialog', { name: 'Save in a list' }),
  ).not.toBeInTheDocument()
})

it('should allow to add a product to a new list', async () => {
  wrap(App)
    .atPath('/product/8731')
    .withNetwork([
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
      {
        path: '/customers/1/shopping-lists/products/8731/shopping-lists-with-product-checks/',
        responseBody: productShoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Descripción Fideos orientales Yakisoba sabor pollo')
  addProductToList()
  const dialog = await screen.findByRole('dialog', { name: 'Save in a list' })
  addProductToNewList(dialog)
  introduceListName('my new list')
  confirmListCreation()
  await screen.findByText('Saved in my new list')

  expect(
    screen.queryByRole('dialog', {
      name: 'Create list, Enter a name for your new list',
    }),
  ).not.toBeInTheDocument()
  expect(
    '/customers/1/shopping-lists/create-with-product/',
  ).toHaveBeenFetchedWith({
    method: 'POST',
    body: {
      name: 'my new list',
      merca_code: '8731',
    },
  })
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'save_new_shopping_list_button_click',
    {
      source: 'product_detail',
      name: 'my new list',
    },
  )
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'create_new_shopping_list_button_click',
    {
      source: 'product_detail',
    },
  )
})

it('display a modal if there is an error when creating the list', async () => {
  wrap(App)
    .atPath('/product/8731')
    .withNetwork([
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
      {
        path: '/customers/1/shopping-lists/products/8731/shopping-lists-with-product-checks/',
        responseBody: productShoppingLists,
      },
      {
        path: '/customers/1/shopping-lists/create-with-product/',
        method: 'POST',
        status: 400,
        requestBody: {
          name: 'my new list',
          merca_code: '8731',
        },
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Descripción Fideos orientales Yakisoba sabor pollo')
  addProductToList()
  const dialog = await screen.findByRole('dialog', { name: 'Save in a list' })
  addProductToNewList(dialog)
  introduceListName('my new list')
  confirmListCreation()

  const errorDialog = await screen.findByRole('dialog', {
    name: 'Operation not performed.It was not possible to create the list, please try again.',
  })
  expect(errorDialog).toBeInTheDocument()
  expect(
    within(errorDialog).getByText('Operation not performed.'),
  ).toBeInTheDocument()
  expect(
    within(errorDialog).getByText(
      'It was not possible to create the list, please try again.',
    ),
  ).toBeInTheDocument()
  closeErrorDialog(errorDialog, 'Understood')
  expect(
    screen.queryByRole('dialog', {
      name: 'Operation not performed.It was not possible to create the list, please try again.',
    }),
  ).not.toBeInTheDocument()
})

it('should allow to cancel adding a product to a new list', async () => {
  wrap(App)
    .atPath('/product/8731')
    .withNetwork([
      { path: '/products/8731/', responseBody: productBaseDetail },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
      {
        path: '/customers/1/shopping-lists/products/8731/shopping-lists-with-product-checks/',
        responseBody: productShoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await act(async () => {
    await screen.findByText(
      'Descripción Fideos orientales Yakisoba sabor pollo',
    )
    addProductToList()
    const dialog = await screen.findByRole('dialog', { name: 'Save in a list' })
    addProductToNewList(dialog)
    cancelListCreation()

    expect(
      screen.queryByRole('dialog', {
        name: 'Create list, Enter a name for your new list',
      }),
    ).not.toBeInTheDocument()
  })
})
