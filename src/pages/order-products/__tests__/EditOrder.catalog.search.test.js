import { screen } from '@testing-library/react'

import { searchProducts } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { order } from 'app/order/__scenarios__/orderDetail'
import { mockSearch } from 'pages/search/__tests__/algolia.mock'
import { shoppingLists } from 'pages/shopping-lists/__tests__/scenarios'
import { Cookie } from 'services/cookie'

const cookies = {
  [import.meta.env.VITE_ACCEPTED_COOKIES]: {
    thirdParty: true,
    necessary: true,
    version: 1,
  },
  [import.meta.env.VITE_DELIVERY_COOKIE]: {
    postalCode: '28001',
    warehouse: 'mad1',
  },
  [import.meta.env.VITE_USER_INFO]: { language: 'en' },
}

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

it('should load the searched products for the order warehouse', async () => {
  vi.spyOn(Cookie, 'get').mockImplementation((cookie) => cookies[cookie])

  const responses = [
    { path: '/customers/1/orders/1235/', responseBody: order },
    { path: '/customers/1/shopping-lists/', responseBody: shoppingLists },
  ]
  wrap(App)
    .atPath('/orders/1235/edit/products/')
    .withNetwork(responses)
    .withLogin()
    .mount()

  await screen.findByText('Products in my order')
  searchProducts('jam')
  await screen.findByText('Jamón serrano Hacendado')

  expect(mockInitIndexImplementation).toHaveBeenCalledWith(
    'products_test_vlc1_en',
  )
})
