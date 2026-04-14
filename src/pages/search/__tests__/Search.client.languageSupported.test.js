import { screen } from '@testing-library/react'

import i18n from 'i18next'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { cookies } from 'app/cookie/__scenarios__/cookies'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

vi.mock('app/i18n/service', async () => {
  return {
    fetchLocaleByLanguage: async (selectedLanguage) => {
      const locale = await vi.importActual(
        `./../../../../public/locales/${selectedLanguage}`,
      )
      return Promise.resolve(locale)
    },
  }
})

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
  i18n.isInitialized = false
})

afterEach(() => {
  vi.clearAllMocks()
})

it('should call to the selected index if the current laguage is supported', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  wrap(App)
    .atPath('/search-results?query=jam')
    .withNetwork()
    .withLogin()
    .mount()

  await screen.findByText('Lists')

  expect(mockInitIndexImplementation).toHaveBeenCalledWith(
    'products_test_vlc1_en',
  )
})
