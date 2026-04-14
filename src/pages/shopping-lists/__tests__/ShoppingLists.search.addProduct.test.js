import { screen, waitFor, within } from '@testing-library/react'

import {
  addProductToShoppingList,
  openShoppingListSearchProduct,
  removeProductFromSearch,
  searchShoppingListProduct,
} from './helpers'
import {
  emptyShoppingListDetail,
  shoppingListDetail,
  shoppingListDetailMilkaElement,
  shoppingLists,
} from './scenarios'
import { searchResult } from './search-scenario'
import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { SearchClient } from 'app/search/client'
import { Cookie } from 'services/cookie'
import { Tracker } from 'services/tracker'
import { cloneDeep } from 'utils/objects'

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

it('should add the product to the shopping list when clicking the button', async () => {
  const shoppingListDetailAfterAddition = cloneDeep(shoppingListDetail)
  shoppingListDetailAfterAddition.items.push(shoppingListDetailMilkaElement)

  SearchClient.search = vi.fn(() => {
    return Promise.resolve(searchResult)
  })
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: shoppingListDetail,
          },
          {
            responseBody: shoppingListDetailAfterAddition,
          },
        ],
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog)
  await addProductToShoppingList('Chocolate con leche Milka')

  expect(
    '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/products/',
  ).toHaveBeenFetchedWith({
    method: 'POST',
    body: {
      merca_code: '12151',
    },
  })
  const milkaMilkChoco = await within(dialog).findByLabelText(
    'Chocolate con leche Milka',
  )
  expect(
    within(milkaMilkChoco).queryByRole('button', { name: 'Save' }),
  ).not.toBeInTheDocument()
  expect(within(milkaMilkChoco).getByText('Saved')).toBeInTheDocument()

  const milkaCookie = within(dialog).getByLabelText(
    'Chocolate con leche Milka galleta',
  )
  expect(within(milkaCookie).queryByText('Saved')).not.toBeInTheDocument()

  const chocoMilkaProductCellHeader = await screen.findByRole('heading', {
    name: 'Chocolate con leche Milka',
    level: 4,
  })
  expect(chocoMilkaProductCellHeader).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'shopping_list_add_products_product_click',
    {
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      list_name: 'My second list',
      products_count: 2,
      product_id: '12151',
      product_name: 'Chocolate con leche Milka',
      action: 'add',
    },
  )
})

it('should allow to add a product to an empty shopping list', async () => {
  const shoppingListDetailAfterAddition = cloneDeep(emptyShoppingListDetail)
  shoppingListDetailAfterAddition.items.push(shoppingListDetailMilkaElement)

  SearchClient.search = vi.fn(() => {
    return Promise.resolve(searchResult)
  })
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: emptyShoppingListDetail,
          },
          {
            responseBody: shoppingListDetailAfterAddition,
          },
        ],
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'my list', level: 1 })
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog)
  await addProductToShoppingList('Chocolate con leche Milka')

  expect(
    '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/products/',
  ).toHaveBeenFetchedWith({
    method: 'POST',
    body: {
      merca_code: '12151',
    },
  })
  const milkaMilkChoco = await within(dialog).findByLabelText(
    'Chocolate con leche Milka',
  )
  expect(
    within(milkaMilkChoco).queryByRole('button', { name: 'Save' }),
  ).not.toBeInTheDocument()
  expect(within(milkaMilkChoco).getByText('Saved')).toBeInTheDocument()

  const milkaCookie = within(dialog).getByLabelText(
    'Chocolate con leche Milka galleta',
  )
  expect(within(milkaCookie).queryByText('Saved')).not.toBeInTheDocument()

  const chocoMilkaProductCellHeader = await screen.findByRole('heading', {
    name: 'Chocolate con leche Milka',
    level: 4,
  })
  expect(chocoMilkaProductCellHeader).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'shopping_list_add_products_product_click',
    {
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      list_name: 'my list',
      products_count: 0,
      product_id: '12151',
      product_name: 'Chocolate con leche Milka',
      action: 'add',
    },
  )
})

it('should display the product as saved if it is already in the shopping list', async () => {
  const shoppingListDetailClone = cloneDeep(shoppingListDetail)
  const searchResultId = '12151'
  shoppingListDetailClone.items[0].product.id = searchResultId
  SearchClient.search = vi.fn(() => {
    return Promise.resolve(searchResult)
  })
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetailClone,
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog)
  const milkaMilkChoco = await within(dialog).findByLabelText(
    'Chocolate con leche Milka',
  )

  expect(within(milkaMilkChoco).getByText('Saved')).toBeInTheDocument()
})

it('should allow to remove a shopping list product from the search', async () => {
  const shoppingListDetailAfterDeletion = shoppingListDetail
  const shoppingListDetailWithMilka = cloneDeep(shoppingListDetail)
  shoppingListDetailWithMilka.items.push(shoppingListDetailMilkaElement)
  SearchClient.search = vi.fn(() => {
    return Promise.resolve(searchResult)
  })
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: shoppingListDetailWithMilka,
          },
          {
            responseBody: shoppingListDetailAfterDeletion,
          },
        ],
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', {
    name: 'My second list',
    level: 1,
  })
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog)
  await removeProductFromSearch('Chocolate con leche Milka')

  expect(
    '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/products/12151/',
  ).toHaveBeenFetchedWith({
    method: 'DELETE',
    body: {},
  })
  const milkaMilkChoco = await within(dialog).findByLabelText(
    'Chocolate con leche Milka',
  )
  expect(
    within(milkaMilkChoco).getByRole('button', { name: 'Save' }),
  ).toBeInTheDocument()
  expect(
    within(milkaMilkChoco).queryByRole('button', { name: 'Saved' }),
  ).not.toBeInTheDocument()

  await waitFor(() => {
    const chocoMilkaProductCellHeader = screen.queryByRole('heading', {
      name: 'Chocolate con leche Milka',
      level: 4,
    })
    expect(chocoMilkaProductCellHeader).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'shopping_list_add_products_product_click',
      {
        list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
        list_name: 'My second list',
        products_count: 2,
        product_id: '12151',
        product_name: 'Chocolate con leche Milka',
        action: 'remove',
      },
    )
  })
})

it('should change the shopping list name style when list has products', async () => {
  const shoppingListDetailWithMilka = cloneDeep(shoppingListDetail)
  shoppingListDetailWithMilka.items.push(shoppingListDetailMilkaElement)
  SearchClient.search = vi.fn(() => {
    return Promise.resolve(searchResult)
  })
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: shoppingListDetailWithMilka,
          },
        ],
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
    ])
    .withLogin()
    .mount()

  const listName = await screen.findByRole('heading', {
    name: 'My second list',
    level: 1,
  })
  expect(listName.parentElement).toHaveClass(
    'shopping-list-detail-header__product-info-wrapper--with-products',
  )
})
