import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  productBaseDetail,
  productWithoutXSelling,
} from 'app/catalog/__scenarios__/product'
import {
  addProduct,
  addProductFromDetail,
  openProductDetail,
} from 'pages/helpers'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')
vi.unmock('app/search/metrics')

describe('Search - Provider - Metrics', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Storage.clear()
    vi.clearAllMocks()
  })

  it('should send provider conversion metrics when add a product from cell', async () => {
    const responses = [
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 1, product_id: '58110', sources: ['+SA'] }],
        },
      },
    ]
    wrap(App)
      .atPath('/search-results?query=jam')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)
    addProduct('Jamón serrano Hacendado')
    await screen.findByLabelText('Show cart', { name: '1' })

    expect('//insights.algolia.io/1/events').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        events: [
          {
            eventName: 'conversion',
            eventType: 'conversion',
            index: 'products_test_vlc1_en',
            userToken: '1',
            objectIDs: ['58110'],
            queryID: 'b25283e88b8a64a9eaf985ad03ffcd8b',
          },
        ],
      },
    })
  })

  it('should send provider click metrics when open a product', async () => {
    const responses = [
      {
        path: '/products/58110/',
        responseBody: productBaseDetail,
      },
      {
        path: '/products/58110/xselling/',
        responseBody: productWithoutXSelling,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 1, product_id: '58110', sources: ['+SA'] }],
        },
      },
    ]
    wrap(App)
      .atPath('/search-results?query=jam')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)
    await openProductDetail('Jamón serrano Hacendado')
    await screen.findByLabelText('Show cart')

    expect('//insights.algolia.io/1/events').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        events: [
          {
            eventName: 'click',
            eventType: 'click',
            index: 'products_test_vlc1_en',
            userToken: '1',
            objectIDs: ['58110'],
            queryID: 'b25283e88b8a64a9eaf985ad03ffcd8b',
            positions: [1],
          },
        ],
      },
    })
  })

  it('should send provider click and conversion metrics when add a product from detail', async () => {
    const responses = [
      {
        path: '/products/58110/',
        responseBody: productBaseDetail,
      },
      {
        path: '/products/58110/xselling/',
        responseBody: productWithoutXSelling,
      },
      {
        path: '/customers/1/cart/',
        method: 'put',
        requestBody: {
          id: '5529dc8b-0a94-4ae0-8145-de5186b542c6',
          lines: [{ quantity: 1, product_id: '58110', sources: ['+SA'] }],
        },
      },
    ]
    wrap(App)
      .atPath('/search-results?query=jam')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)
    await openProductDetail('Jamón serrano Hacendado')
    await addProductFromDetail('Jamón serrano Hacendado')
    await screen.findByLabelText('Show cart')

    expect('//insights.algolia.io/1/events').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        events: [
          {
            eventName: 'click',
            eventType: 'click',
            index: 'products_test_vlc1_en',
            userToken: '1',
            objectIDs: ['58110'],
            queryID: 'b25283e88b8a64a9eaf985ad03ffcd8b',
            positions: [1],
          },
        ],
      },
    })
    expect('//insights.algolia.io/1/events').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        events: [
          {
            eventName: 'conversion',
            eventType: 'conversion',
            index: 'products_test_vlc1_en',
            userToken: '1',
            objectIDs: ['58110'],
            queryID: 'b25283e88b8a64a9eaf985ad03ffcd8b',
          },
        ],
      },
    })
  })
})
