import { screen } from '@testing-library/react'

import {
  clickOnPostalCode,
  confirmAddressForm,
  openCart,
  openChangeAddressModal,
} from './helpers'
import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app.jsx'
import {
  address,
  addressFromDifferentWarehouse,
} from 'app/address/__scenarios__/address'
import { homeWithGridAndProductNotAvailableInMad } from 'app/catalog/__scenarios__/home'
import {
  cookies,
  cookiesWithMadWarehouse,
} from 'app/cookie/__scenarios__/cookies'
import { SearchClient } from 'app/search/client'
import { mockSearch } from 'pages/search/__tests__/algolia.mock'
import { search } from 'pages/search/__tests__/helpers.js'
import { Cookie } from 'services/cookie'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

const vlc1PostalCode = '46010'
const mad1PostalCode = '28001'

configure({
  changeRoute: (route) => history.push(route),
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

it('should call the search with the new warehouse once you change the address to a new warehouse', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])
  vi.spyOn(SearchClient, 'search')
  const responses = [
    {
      path: '/customers/1/home/?lang=en&wh=vlc1',
      responseBody: homeWithGridAndProductNotAvailableInMad,
    },
    {
      path: `/customers/1/addresses/?lang=en&wh=vlc1`,
      responseBody: { results: [address, addressFromDifferentWarehouse] },
    },
    {
      path: `/customers/1/addresses/${addressFromDifferentWarehouse.id}/make_default/?lang=en&wh=vlc1`,
      method: 'patch',
      responseBody: addressFromDifferentWarehouse,
      headers: { 'x-customer-pc': mad1PostalCode, 'x-customer-wh': 'mad1' },
    },
  ]
  wrap(App)
    .atPath('/search-results?query=turia')
    .withNetwork(responses)
    .withLogin()
    .mount()

  await screen.findByLabelText('Show cart')

  openCart()
  openChangeAddressModal(vlc1PostalCode)
  await screen.findByText(mad1PostalCode)
  clickOnPostalCode(mad1PostalCode)

  confirmAddressForm()

  Cookie.get = vi.fn((cookie) => cookiesWithMadWarehouse[cookie])

  expect(await screen.findByText('Delivery in 28001')).toBeInTheDocument()

  search('jamones')
  expect(mockInitIndexImplementation).toHaveBeenCalledWith(
    'products_test_mad1_en',
  )
})
