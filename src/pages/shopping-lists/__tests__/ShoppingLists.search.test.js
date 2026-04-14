import { screen, waitFor, within } from '@testing-library/react'

import {
  clearSearchText,
  clickOutsideDialog,
  clickSearchXButton,
  closeSearchByClickCloseButton,
  openShoppingListSearchProduct,
  searchShoppingListProduct,
} from './helpers'
import { shoppingListDetail, shoppingLists } from './scenarios'
import { emptySearchResult, searchResult } from './search-scenario'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { SearchClient } from 'app/search/client'
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

it('should send the event add products button click', async () => {
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
  openShoppingListSearchProduct()
  await screen.findByRole('dialog', {
    name: 'Search products',
  })

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'shopping_list_add_products_button_click',
    {
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      list_name: 'My second list',
      products_count: 2,
    },
  )
})

it('should focus on the search input when opening the dialog', async () => {
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
  openShoppingListSearchProduct()
  const dialog = await screen.findByRole('dialog', {
    name: 'Search products',
  })

  expect(within(dialog).getByLabelText('Search products')).toHaveFocus()
})

it('should close the dialog when clicking outside the dialog', async () => {
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
  openShoppingListSearchProduct()
  await screen.findByRole('dialog', {
    name: 'Search products',
  })
  clickOutsideDialog()

  expect(
    screen.queryByRole('dialog', { name: 'Search products' }),
  ).not.toBeInTheDocument()
})

it('should allow to close the dialog when clicking on the close button', async () => {
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
  openShoppingListSearchProduct()
  const searchDialog = await screen.findByRole('dialog', {
    name: 'Search products',
  })
  closeSearchByClickCloseButton(searchDialog)

  expect(
    screen.queryByRole('dialog', { name: 'Search products' }),
  ).not.toBeInTheDocument()
})

it('should display the dialog with the correct header', async () => {
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
  openShoppingListSearchProduct()

  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  expect(dialog).toBeInTheDocument()
  expect(
    within(dialog).getByRole('heading', { name: 'Search products', level: 3 }),
  ).toBeInTheDocument()
})

it('should display the dialog when clicking on the search icon button', async () => {
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

  openShoppingListSearchProduct()

  const dialog = screen.getByRole('dialog', { name: 'Search products' })

  expect(dialog).toBeInTheDocument()
})

it('should display the empty place holder for empty searches', async () => {
  SearchClient.search = vi.fn(() => {
    return Promise.resolve(emptySearchResult)
  })
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
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog)

  expect(
    await within(dialog).findByText('There are no results'),
  ).toBeInTheDocument()
})

it('should not display the empty placeholder when opening the dialog', async () => {
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
  openShoppingListSearchProduct()
  const dialog = await screen.findByRole('dialog', {
    name: 'Search products',
  })

  expect(
    within(dialog).queryByText('There are no results'),
  ).not.toBeInTheDocument()
})

it('should display the search results', async () => {
  SearchClient.search = vi.fn(() => {
    return Promise.resolve(searchResult)
  })
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
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog)

  const milkaMilkChoco = await within(dialog).findByLabelText(
    'Chocolate con leche Milka',
  )
  expect(
    within(milkaMilkChoco).getByText('Chocolate con leche Milka'),
  ).toBeInTheDocument()
  expect(within(milkaMilkChoco).getByText('Tableta')).toBeInTheDocument()
  expect(within(milkaMilkChoco).getByText('150 g')).toBeInTheDocument()
  expect(within(milkaMilkChoco).getByText('2,15 €')).toBeInTheDocument()
  expect(within(milkaMilkChoco).getByText('/unit')).toBeInTheDocument()
  expect(within(milkaMilkChoco).getByRole('img')).toBeInTheDocument()

  const milkaCookie = within(dialog).getByLabelText(
    'Chocolate con leche Milka galleta',
  )
  expect(
    within(milkaCookie).getByText('Chocolate con leche Milka galleta'),
  ).toBeInTheDocument()
  expect(within(milkaCookie).getByText('Tableta')).toBeInTheDocument()
  expect(within(milkaCookie).getByText('300 g')).toBeInTheDocument()
  expect(within(milkaCookie).getByText('4,50 €')).toBeInTheDocument()
  expect(within(milkaCookie).getByText('/unit')).toBeInTheDocument()
  expect(within(milkaCookie).getByRole('img')).toBeInTheDocument()

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'shopping_lists_add_products_search_results',
    {
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      list_name: 'My second list',
      query: 'milk',
      number_of_results: 2,
      mercas: ['12151', '12016'],
    },
  )

  expect(SearchClient.search).toHaveBeenCalledWith({
    analytics: false,
    query: 'milk',
    warehouse: 'vlc1',
  })
})

it('should not send the shopping_lists_add_products_search_results event for empty searches', async () => {
  SearchClient.search = vi.fn(() => {
    return Promise.resolve(searchResult)
  })
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
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog)

  await within(dialog).findByLabelText('Chocolate con leche Milka')

  expect(Tracker.sendInteraction).not.toHaveBeenCalledWith(
    'shopping_lists_add_products_search_results',
    {
      query: '',
      number_of_results: 0,
      mercas: [],
    },
  )
})

it('should not display the search results for text of two characters', async () => {
  SearchClient.search = vi.fn(() => {
    return Promise.resolve(searchResult)
  })
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
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog, 'mi')

  await waitFor(() => {
    expect(
      within(dialog).queryByText('Chocolate con leche Milka'),
    ).not.toBeInTheDocument()
  })
})

it('should perform the search for text of two characters when the user is removing the search but has already some results', async () => {
  SearchClient.search = vi.fn(() => {
    return Promise.resolve(searchResult)
  })
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
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog)
  searchShoppingListProduct(dialog, '{backspace}')
  searchShoppingListProduct(dialog, '{backspace}')
  expect(
    await within(dialog).findByLabelText('Chocolate con leche Milka'),
  ).toBeInTheDocument()
})

it('should not display the search results after completely deleting the current search', async () => {
  SearchClient.search = vi.fn(() => {
    return Promise.resolve(searchResult)
  })
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
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog)
  await within(dialog).findByLabelText('Chocolate con leche Milka')
  clearSearchText()
  await screen.findByRole('dialog', { name: 'Search products' })

  await waitFor(() => {
    expect(
      screen.queryByLabelText('Chocolate con leche Milka'),
    ).not.toBeInTheDocument()
  })
})

it('should clear the results when clicking on the X button from the search', async () => {
  SearchClient.search = vi.fn(() => {
    return Promise.resolve(searchResult)
  })
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
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog)
  await within(dialog).findByLabelText('Chocolate con leche Milka')
  clickSearchXButton()
  await screen.findByRole('dialog', { name: 'Search products' })

  await waitFor(() => {
    expect(
      screen.queryByLabelText('Chocolate con leche Milka'),
    ).not.toBeInTheDocument()
  })
})

it('should perform a debounce search', async () => {
  SearchClient.search = vi.fn(() => {
    return Promise.resolve(searchResult)
  })
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
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog)
  await within(dialog).findByLabelText('Chocolate con leche Milka')

  expect(SearchClient.search).not.toHaveBeenCalledWith({
    query: 'm',
    warehouse: 'vlc1',
  })
  expect(SearchClient.search).not.toHaveBeenCalledWith({
    query: 'mi',
    warehouse: 'vlc1',
  })
  expect(SearchClient.search).not.toHaveBeenCalledWith({
    query: 'mil',
    warehouse: 'vlc1',
  })
})
