import { screen, within } from '@testing-library/react'

import {
  addProductToShoppingList,
  clearSearchText,
  closeSearchDialog,
  openShoppingListSearchProduct,
  removeProductFromSearch,
  searchShoppingListProduct,
} from './helpers'
import {
  shoppingListDetail,
  shoppingListDetailMilkaElement,
  shoppingLists,
} from './scenarios'
import { suggestions } from './scenarios.suggestions'
import { emptySearchResult, searchResult } from './search-scenario'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { SearchClient } from 'app/search/client'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

configure({
  changeRoute: (route) => history.push(route),
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should display the suggestions when starting the shopping list search', async () => {
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
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/search/product-suggestions/',
        responseBody: suggestions,
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
    await within(dialog).findByText('Suggestions for your list'),
  ).toBeInTheDocument()
  expect(
    within(dialog).getByLabelText('Leche semidesnatada Asturiana'),
  ).toBeInTheDocument()
  expect(
    within(dialog).getByLabelText(
      'Patatas prefritas corte grueso Hacendado ultracongeladas',
    ),
  ).toBeInTheDocument()
  expect(
    within(dialog).getByLabelText('Pizza 4 quesos Hacendado'),
  ).toBeInTheDocument()
  expect(
    within(dialog).getByLabelText('Pizza jamón y queso Hacendado'),
  ).toBeInTheDocument()
})

it('should display the correct information for a given suggestion', async () => {
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
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/search/product-suggestions/',
        responseBody: suggestions,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openShoppingListSearchProduct()
  const dialog = await screen.findByRole('dialog', {
    name: 'Search products',
  })
  await within(dialog).findByText('Suggestions for your list')

  const suggestion = within(dialog).getByLabelText(
    'Leche semidesnatada Asturiana',
  )
  expect(within(suggestion).getByRole('img')).toHaveAttribute(
    'src',
    'https://sta-mercadona.imgix.net/images/0c8a3512247dc5ee00be418d312b3e7a.jpg?fit=crop&h=300&w=300',
  )
  expect(
    within(suggestion).getByText('Leche semidesnatada Asturiana'),
  ).toBeInTheDocument()
  expect(within(suggestion).getByText('10,92 €')).toBeInTheDocument()
  expect(within(suggestion).getByText('/pack')).toBeInTheDocument()
})

it('should allow to add a suggestion to the shopping list', async () => {
  const shoppingListDetailAfterAddition = structuredClone(shoppingListDetail)
  shoppingListDetailAfterAddition.items.push(shoppingListDetailMilkaElement)

  const secondSuggestionsBatch = structuredClone(suggestions)

  secondSuggestionsBatch.suggested_products[0].display_name =
    'Queso Fresco Segunda Sugerencia'

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
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/search/product-suggestions/',
        responseBody: suggestions,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        multipleResponses: [
          {
            responseBody: suggestions,
          },
          {
            responseBody: secondSuggestionsBatch,
          },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openShoppingListSearchProduct()
  const dialog = await screen.findByRole('dialog', {
    name: 'Search products',
  })
  await within(dialog).findByText('Suggestions for your list')
  await addProductToShoppingList('Leche semidesnatada Asturiana')

  expect(
    '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/products/',
  ).toHaveBeenFetchedWith({
    method: 'POST',
    body: {
      merca_code: '10505',
    },
  })
  expect(
    await screen.findByText('Chocolate con leche Milka'),
  ).toBeInTheDocument()
  expect(
    screen.queryByText('Queso Fresco Segunda Sugerencia'),
  ).not.toBeInTheDocument()

  expect(within(dialog).getByText('Saved')).toBeInTheDocument()

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('sl_suggestion_click', {
    list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
    list_name: 'My second list',
    product_id: '10505',
    display_name: 'Leche semidesnatada Asturiana',
    order: 0,
    suggestions: '10505,61405,63580,63581',
    source: 'search',
    action: 'add',
  })
})

it('should allow to remove a suggestion to the shopping list', async () => {
  const secondSuggestionsBatch = structuredClone(suggestions)

  secondSuggestionsBatch.suggested_products[0].display_name =
    'Queso Fresco Segunda Sugerencia'

  const shoppingListDetailAfterAddition = structuredClone(shoppingListDetail)
  shoppingListDetailAfterAddition.items.push(shoppingListDetailMilkaElement)
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
          {
            responseBody: shoppingListDetail,
          },
        ],
      },
      {
        path: '/customers/1/shopping-lists/',
        responseBody: shoppingLists,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/search/product-suggestions/',
        responseBody: suggestions,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        multipleResponses: [
          {
            responseBody: suggestions,
          },
          {
            responseBody: secondSuggestionsBatch,
          },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openShoppingListSearchProduct()
  const dialog = await screen.findByRole('dialog', {
    name: 'Search products',
  })
  await within(dialog).findByText('Suggestions for your list')
  await addProductToShoppingList('Leche semidesnatada Asturiana')
  await removeProductFromSearch('Leche semidesnatada Asturiana')

  expect(
    '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/products/10505/',
  ).toHaveBeenFetchedWith({
    method: 'DELETE',
    body: {},
  })

  expect(
    await screen.findByText('Chocolate con leche Milka'),
  ).not.toBeInTheDocument()
  expect(
    screen.queryByText('Queso Fresco Segunda Sugerencia'),
  ).not.toBeInTheDocument()
  const [firstSuggestionIsNoSaved] = within(dialog).getAllByText('Save')
  expect(firstSuggestionIsNoSaved).toBeInTheDocument()

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('sl_suggestion_click', {
    list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
    list_name: 'My second list',
    product_id: '10505',
    display_name: 'Leche semidesnatada Asturiana',
    order: 0,
    suggestions: '10505,61405,63580,63581',
    source: 'search',
    action: 'remove',
  })
})

it('should refresh the shopping list suggestions when closing the search dialog', async () => {
  const secondSuggestionsBatch = structuredClone(suggestions)

  secondSuggestionsBatch.suggested_products[0].display_name =
    'Queso Fresco Segunda Sugerencia'

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
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/search/product-suggestions/',
        responseBody: suggestions,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        multipleResponses: [
          {
            responseBody: suggestions,
          },
          {
            responseBody: secondSuggestionsBatch,
          },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openShoppingListSearchProduct()
  const dialog = await screen.findByRole('dialog', {
    name: 'Search products',
  })
  await within(dialog).findByText('Suggestions for your list')
  closeSearchDialog()

  expect(
    await screen.findByText('Queso Fresco Segunda Sugerencia'),
  ).toBeInTheDocument()
})

it('should not display the suggestions when showing search results', async () => {
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
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/search/product-suggestions/',
        responseBody: suggestions,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openShoppingListSearchProduct()
  const dialog = await screen.findByRole('dialog', {
    name: 'Search products',
  })
  searchShoppingListProduct(dialog)
  await screen.findByText('Chocolate con leche Milka galleta')

  expect(
    within(dialog).queryByText(
      'Patatas prefritas corte grueso Hacendado ultracongeladas',
    ),
  ).not.toBeInTheDocument()
})

it('should not display the suggestions when the empty placeholder is displayed', async () => {
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
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/search/product-suggestions/',
        responseBody: suggestions,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openShoppingListSearchProduct()
  const dialog = await screen.findByRole('dialog', {
    name: 'Search products',
  })
  searchShoppingListProduct(dialog)
  await within(dialog).findByText('There are no results')

  expect(
    within(dialog).queryByText(
      'Patatas prefritas corte grueso Hacendado ultracongeladas',
    ),
  ).not.toBeInTheDocument()
})

it('should not display the suggestions if the user writes before the suggestion request resolves', async () => {
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
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/search/product-suggestions/',
        responseBody: suggestions,
        delay: 200,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openShoppingListSearchProduct()
  const dialog = await screen.findByRole('dialog', {
    name: 'Search products',
  })
  searchShoppingListProduct(dialog)
  await screen.findByText('Chocolate con leche Milka galleta')
  clearSearchText()

  expect(
    within(dialog).queryByText(
      'Patatas prefritas corte grueso Hacendado ultracongeladas',
    ),
  ).not.toBeInTheDocument()
})

it('should display the suggestions after clearing the search', async () => {
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
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/search/product-suggestions/',
        responseBody: suggestions,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openShoppingListSearchProduct()
  const dialog = await screen.findByRole('dialog', {
    name: 'Search products',
  })
  searchShoppingListProduct(dialog)
  await screen.findByText('Chocolate con leche Milka galleta')
  clearSearchText()

  expect(
    within(dialog).queryByText(
      'Patatas prefritas corte grueso Hacendado ultracongeladas',
    ),
  ).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith('sl_suggestions_view', {
    list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
    list_name: 'My second list',
    suggestions: '10505,61405,63580,63581',
    list_products_count: 2,
    source: 'search',
  })

  const slSuggestionsViewCount = (
    Tracker.sendInteraction as jest.Mock
  ).mock.calls.filter(
    ([eventName]) => eventName === 'sl_suggestions_view',
  ).length

  expect(slSuggestionsViewCount).toBe(1)
})
