import { screen } from '@testing-library/react'

import { goToCategories, seeAllProducts } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  categories,
  categoryDetail,
} from 'app/catalog/__scenarios__/categories'
import { recommendations } from 'app/catalog/__scenarios__/recommendations'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('My Regulars', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should show the recommended products', async () => {
    const responses = {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    }
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    const product = await screen.findByText(
      'Fideos orientales Yakisoba sabor pollo Hacendado',
    )

    expect(product).toBeInTheDocument()
  })

  it('should show the recommended products for the session warehouse', async () => {
    const responses = {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    }
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')

    expect(global.fetch).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringContaining(
          '/customers/1/recommendations/myregulars/?lang=en&wh=vlc1',
        ),
        method: 'GET',
      }),
    )
  })

  it('should navigate to categories page', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Categories')
    goToCategories()
    const categoryTitle = await screen.findByText('Aceite de oliva')

    expect(categoryTitle).toBeInTheDocument()
  })

  it('should navigate to categories page when there are not recommendations', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: [],
      },
      { path: '/categories/', responseBody: categories },
      { path: '/categories/112/', responseBody: categoryDetail },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Make your first order to see your essentials')
    seeAllProducts()
    await screen.findByText('Aceite de oliva')

    expect(screen.getByText('Aceite, especias y salsas')).toBeInTheDocument()
  })
})
