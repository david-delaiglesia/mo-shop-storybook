import { screen, waitFor } from '@testing-library/react'

import {
  openShoppingListSearchProduct,
  searchShoppingListProduct,
} from './helpers'
import { shoppingListDetail, shoppingLists } from './scenarios'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const mockSearch = vi.fn().mockImplementation(() => {
  const algoliaDummyResult = { query: '', hits: [], queryId: '' }

  return algoliaDummyResult
})

vi.mock('algoliasearch', () => {
  const algoliasearch = () => {
    return {
      searchSingleIndex: ({ searchParams }) => {
        const results = mockSearch(searchParams)

        return results
      },
    }
  }

  return { algoliasearch }
})

configure({
  changeRoute: (route) => history.push(route),
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should display the search results', async () => {
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

  await waitFor(() => {
    expect(mockSearch).toHaveBeenCalledWith({
      query: 'milk',
      analytics: false,
      analyticsTags: ['web'],
      clickAnalytics: true,
      facetFilters: undefined,
      filters: undefined,
      userToken: '1',
      getRankingInfo: true,
    })
  })
})
