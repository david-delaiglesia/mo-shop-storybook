import { fireEvent, screen, waitFor, within } from '@testing-library/react'

import {
  addFirstSuggestionToList,
  addProductToShoppingList,
  confirmErrorDialog,
  loadMoreSuggestions,
  openShoppingListSearchProduct,
  searchShoppingListProduct,
} from './helpers'
import {
  shoppingListDetail,
  shoppingListDetailMilkaElement,
  shoppingLists,
} from './scenarios'
import {
  emptySuggestions,
  lecheSemiAsturiana,
  moreSuggestions,
  suggestions,
  suggestionsAfterAddition,
} from './scenarios.suggestions'
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

it('should display shopping list data after the first 404 suggestion response', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        responseBody: suggestions,
        status: 404,
        delay: 300,
      },
    ])
    .withLogin()
    .mount()

  const loadingSuggestions = await screen.findAllByLabelText(
    'Cargando sugerencias',
  )
  expect(screen.queryByText('There are no suggestions')).not.toBeInTheDocument()
  expect(loadingSuggestions[0]).toBeInTheDocument()
  expect(
    await screen.findByText('Suggestions for your list'),
  ).toBeInTheDocument()
  expect(screen.getByText('2 products')).toBeInTheDocument()
})

it('should display shopping list data if the suggestions fails with some unexpected error code', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        responseBody: suggestions,
        status: 500,
      },
    ])
    .withLogin()
    .mount()

  const loadingSuggestions = await screen.findAllByLabelText(
    'Cargando sugerencias',
  )
  expect(screen.queryByText('There are no suggestions')).not.toBeInTheDocument()
  expect(loadingSuggestions[0]).toBeInTheDocument()
  expect(
    await screen.findByText('Suggestions for your list'),
  ).toBeInTheDocument()
  expect(screen.getByText('2 products')).toBeInTheDocument()
})

it('should not display shopping list data if the api returns a 420 error code', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        responseBody: suggestions,
        status: 420,
      },
    ])
    .withLogin()
    .mount()

  expect(await screen.findByText('2 products')).toBeInTheDocument()
  expect(
    screen.queryByText('Suggestions for your list'),
  ).not.toBeInTheDocument()
})

it('should display the product suggestions when the shopping list is loaded', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        responseBody: suggestions,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Suggestions for your list')

  expect(screen.getByText('Leche semidesnatada Asturiana')).toBeInTheDocument()
  expect(screen.getByText('10,92 €')).toBeInTheDocument()
  expect(screen.getByText('/pack')).toBeInTheDocument()

  expect(
    screen.getByText(
      'Patatas prefritas corte grueso Hacendado ultracongeladas',
    ),
  ).toBeInTheDocument()
  expect(screen.getByText('3,10 €')).toBeInTheDocument()
  expect(screen.getAllByText('/unit')[0]).toBeInTheDocument()

  expect(screen.getByText('Pizza 4 quesos Hacendado')).toBeInTheDocument()
  expect(screen.getByText('2,90 €')).toBeInTheDocument()
  expect(screen.getAllByText('/unit')[1]).toBeInTheDocument()

  expect(screen.getByText('Pizza jamón y queso Hacendado')).toBeInTheDocument()
  expect(screen.getByText('2,50 €')).toBeInTheDocument()
  expect(screen.getAllByText('/unit')[2]).toBeInTheDocument()

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'sl_suggestions_loaded',
    {
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      list_name: 'My second list',
      suggestions: '10505,61405,63580,63581',
      list_products_count: 2,
      source: 'bottom_list',
    },
  )
})

it('should display a placeholder when there are no suggestions', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        responseBody: emptySuggestions,
      },
    ])
    .withLogin()
    .mount()

  expect(
    await screen.findByText('There are no suggestions'),
  ).toBeInTheDocument()
  expect(
    screen.queryByRole('button', {
      name: 'See other suggestions',
    }),
  ).not.toBeInTheDocument()
})

it('should allow to add a suggestion to the current list', async () => {
  const shoppingListDetailAfterAddition = cloneDeep(shoppingListDetail)
  shoppingListDetailAfterAddition.items.push(lecheSemiAsturiana)
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
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        multipleResponses: [
          { responseBody: suggestions },
          { responseBody: suggestionsAfterAddition },
          { responseBody: suggestionsAfterAddition },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Suggestions for your list')
  await addFirstSuggestionToList()

  expect(screen.getByRole('button', { name: 'Saved' })).toBeInTheDocument()
  expect(
    '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/products/',
  ).toHaveBeenFetchedWith({
    method: 'POST',
    body: {
      merca_code: '10505',
    },
  })
  expect(
    await screen.findByRole('heading', {
      name: 'Leche semidesnatada Asturiana',
    }),
  ).toBeInTheDocument()
  expect(await screen.findByText('3 Barras de pan')).toBeInTheDocument()
  expect(Tracker.sendInteraction).toHaveBeenCalledWith('sl_suggestion_click', {
    list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
    list_name: 'My second list',
    product_id: '10505',
    display_name: 'Leche semidesnatada Asturiana',
    order: 1,
    suggestions: '10505,61405,63580,63581',
    source: 'bottom_list',
    action: 'add',
  })
})

it('should display a generic error if the suggestion addition fails', async () => {
  const shoppingListDetailAfterAddition = cloneDeep(shoppingListDetail)
  shoppingListDetailAfterAddition.items.push(lecheSemiAsturiana)
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        responseBody: suggestions,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/products/',
        method: 'POST',
        requestBody: {
          merca_code: '10505',
        },
        status: 500,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Suggestions for your list')
  await addFirstSuggestionToList()

  const errorDialog = await screen.findByRole('dialog', {
    name: 'Operation not performed.The action taken has failed. If the error persists, please contact us via chat.',
  })
  expect(errorDialog).toBeInTheDocument()
  expect(
    within(errorDialog).getByText(
      'The action taken has failed. If the error persists, please contact us via chat.',
    ),
  ).toBeInTheDocument()
  confirmErrorDialog(errorDialog)
  expect(
    screen.queryByRole('button', { name: 'Saved' }),
  ).not.toBeInTheDocument()
})

it('should display the skeleton after an addition is getting a status 404', async () => {
  const shoppingListDetailAfterAddition = cloneDeep(shoppingListDetail)
  shoppingListDetailAfterAddition.items.push(lecheSemiAsturiana)
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        multipleResponses: [
          { responseBody: suggestions },
          { responseBody: suggestionsAfterAddition, status: 404 },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Suggestions for your list')
  await addFirstSuggestionToList()

  const [firstLoader] = await screen.findAllByLabelText('Cargando sugerencias')
  expect(firstLoader).toBeInTheDocument()
})

it('should allow to display a new group of suggestions', async () => {
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        multipleResponses: [
          {
            responseBody: suggestions,
          },
          {
            responseBody: moreSuggestions,
          },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Suggestions for your list')
  loadMoreSuggestions()

  expect(
    await screen.findByText('Picos saladitos Hacendado'),
  ).toBeInTheDocument()
  expect(
    '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/refresh-suggested-products/',
  ).toHaveBeenFetchedWith({
    method: 'POST',
    body: {},
  })

  expect(Tracker.sendInteraction).toHaveBeenCalledWith(
    'sl_suggestions_reload_click',
    {
      list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
      list_name: 'My second list',
      source: 'text',
      suggestions: '10505,61405,63580,63581',
    },
  )
})

it('should refresh the suggestion section after adding a product to the shopping list', async () => {
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
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        multipleResponses: [
          {
            responseBody: suggestions,
          },
          {
            responseBody: moreSuggestions,
          },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByRole('heading', { name: 'My second list', level: 1 })
  openShoppingListSearchProduct()
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  searchShoppingListProduct(dialog)
  await addProductToShoppingList('Chocolate con leche Milka')
  await within(dialog).findByLabelText('Chocolate con leche Milka')

  expect(
    await screen.findByText('Picos saladitos Hacendado'),
  ).toBeInTheDocument()
})

it('should scroll to bottom of page when saving a suggestion', async () => {
  const scrollIntoViewFn = vi.fn()
  window.HTMLElement.prototype.scrollIntoView = scrollIntoViewFn

  const shoppingListDetailAfterAddition = cloneDeep(shoppingListDetail)
  shoppingListDetailAfterAddition.items.push(lecheSemiAsturiana)
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
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        multipleResponses: [
          { responseBody: suggestions },
          { responseBody: suggestionsAfterAddition },
          { responseBody: suggestionsAfterAddition },
        ],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Suggestions for your list')
  await addFirstSuggestionToList()
  await waitFor(() => expect(scrollIntoViewFn).toHaveBeenCalled())
})

it('should not scroll to bottom of page when saving a suggestion and there ar eno more suggestions', async () => {
  const scrollIntoViewFn = vi.fn()
  window.HTMLElement.prototype.scrollIntoView = scrollIntoViewFn

  const suggestionClone = cloneDeep(suggestions)
  suggestionClone.suggested_products = suggestions.suggested_products.slice(
    0,
    1,
  )
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        multipleResponses: [
          {
            responseBody: shoppingListDetail,
          },
        ],
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        multipleResponses: [{ responseBody: suggestionClone }],
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Suggestions for your list')
  await addFirstSuggestionToList()
  await waitFor(() => expect(scrollIntoViewFn).not.toHaveBeenCalled())
})

it('should send event sl_suggestions_view only once when 2 products are visible from suggestions', async () => {
  const shoppingListDetailAfterAddition = cloneDeep(shoppingListDetail)
  shoppingListDetailAfterAddition.items.push(lecheSemiAsturiana)
  wrap(App)
    .atPath('/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/')
    .withNetwork([
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/',
        responseBody: shoppingListDetail,
      },
      {
        path: '/customers/1/shopping-lists/0191fa22-176e-7c35-811c-4eed128a7679/suggested-products/',
        responseBody: suggestions,
      },
    ])
    .withLogin()
    .mount()

  await screen.findByText('Suggestions for your list')

  fireEvent(window, new Event('scrollend'))
  fireEvent(window, new Event('scrollend'))

  expect(Tracker.sendInteraction).toHaveBeenCalledWith('sl_suggestions_view', {
    list_id: '0191fa22-176e-7c35-811c-4eed128a7679',
    list_name: 'My second list',
    suggestions: '10505,61405,63580,63581',
    list_products_count: 2,
    source: 'bottom_list',
  })
  expect(Tracker.sendInteraction).toHaveBeenCalledTimes(3)
})
