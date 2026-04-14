import { screen } from '@testing-library/react'

import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
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

describe('Home - Search provider - Metrics', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Storage.clear()
    vi.clearAllMocks()
  })

  it('should send provider conversion_without_search metrics when add a product from cell outside the search', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByLabelText('Show cart', { name: '1' })

    expect('//insights.algolia.io/1/events').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        events: [
          {
            eventName: 'conversion_without_search',
            eventType: 'conversion',
            index: 'products_test_vlc1_en',
            userToken: '1',
            objectIDs: ['8731'],
          },
        ],
      },
    })
  })

  it('should send provider conversion_without_search metrics when add a product from detail outside the search', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/?lang=es&wh=vlc1',
        responseBody: { ...productBaseDetail },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByRole('dialog')
    await addProductFromDetail(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    await screen.findByLabelText('Show cart', { name: '1' })

    expect('//insights.algolia.io/1/events').toHaveBeenFetchedWith({
      method: 'POST',
      body: {
        events: [
          {
            eventName: 'conversion_without_search',
            eventType: 'conversion',
            index: 'products_test_vlc1_en',
            userToken: '1',
            objectIDs: ['8731'],
          },
        ],
      },
    })
  })

  it('should send provider conversion_without_search metrics one time when add a product from cell outside the search', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')
    await screen.findByLabelText('Show cart', { name: '2' })

    expect('//insights.algolia.io/1/events').toHaveBeenFetchedTimes(1)
  })

  it('should send provider conversion_without_search metrics one time when add a product from detail outside the search', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/?lang=es&wh=vlc1',
        responseBody: { ...productBaseDetail },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')

    await screen.findByRole('dialog')

    await addProductFromDetail(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    await addProductFromDetail(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )

    await screen.findByLabelText('Show cart', { name: '2' })

    expect('//insights.algolia.io/1/events').toHaveBeenFetchedTimes(1)
  })

  it('should send provider conversion_without_search metrics one time when add a product from different points', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
      {
        path: '/products/8731/?lang=es&wh=vlc1',
        responseBody: { ...productBaseDetail },
      },
      {
        path: '/products/8731/xselling/',
        responseBody: productWithoutXSelling,
      },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

    addProduct('Fideos orientales Yakisoba sabor pollo Hacendado')

    await openProductDetail('Fideos orientales Yakisoba sabor pollo Hacendado')

    await screen.findByRole('dialog')

    await addProductFromDetail(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )
    await screen.findByLabelText('Show cart', { name: '2' })

    expect('//insights.algolia.io/1/events').toHaveBeenFetchedTimes(1)
  })
})
