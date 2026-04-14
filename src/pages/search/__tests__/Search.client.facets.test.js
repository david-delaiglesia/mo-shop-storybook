import { screen } from '@testing-library/react'

import { selectCategory } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { mockSearch } from 'pages/search/__tests__/algolia.mock'
import { Cookie } from 'services/cookie'

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

it('should show the searched products and filtered by category from the proper warehouse', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  wrap(App)
    .atPath('/search-results?query=jam')
    .withNetwork()
    .withLogin()
    .mount()

  await screen.findByText(/Showing 3 results for 'jam'/)
  selectCategory('Charcutería y quesos')
  await screen.findByText(/Showing 2 results for 'jam'/)

  expect(mockInitIndexImplementation).toHaveBeenLastCalledWith(
    'products_test_vlc1_en',
  )
})
