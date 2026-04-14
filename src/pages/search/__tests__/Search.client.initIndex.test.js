import { waitFor } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const mockInitIndexImplementation = vi.fn()
vi.mock('algoliasearch', () => {
  const algoliasearch = () => {
    return {
      searchSingleIndex: ({ indexName, searchParams }) => {
        mockInitIndexImplementation(indexName)
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

it('should show the searched products from the proper warehouse', async () => {
  wrap(App)
    .atPath('/search-results?query=jam')
    .withNetwork()
    .withLogin()
    .mount()

  await waitFor(() =>
    expect(mockInitIndexImplementation).toHaveBeenCalledWith(
      'products_test_vlc1_en',
    ),
  )
})
