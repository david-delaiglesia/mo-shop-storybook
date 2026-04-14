import { waitFor } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'

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
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
})

afterEach(() => {
  Storage.clear()
  vi.clearAllMocks()
})

it('should show the searched products', async () => {
  wrap(App)
    .atPath('/search-results?query=jam')
    .withNetwork()
    .withLogin()
    .mount()

  await waitFor(() =>
    expect(mockSearch).toHaveBeenCalledWith({
      query: 'jam',
      analyticsTags: ['web'],
      clickAnalytics: true,
      facetFilters: undefined,
      filters: undefined,
      userToken: '1',
      getRankingInfo: true,
      analytics: true,
    }),
  )
})
