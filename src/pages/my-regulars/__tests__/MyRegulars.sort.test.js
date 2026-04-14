import { screen } from '@testing-library/react'

import {
  clickOut,
  selectSortByCategory,
  selectSortByImportance,
  toggleSortingMenu,
} from './helpers'
import { vi } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import {
  manyRecommendations,
  recommendations,
} from 'app/catalog/__scenarios__/recommendations'
import { Storage } from 'services/storage'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('My Regulars - Sort', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    vi.clearAllMocks()
    Storage.clear()
    localStorage.clear()
  })

  it('should sort by importance by default', async () => {
    const responses = {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    }

    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Sort By importance')

    expect(screen.getByText('Sort By importance')).toBeInTheDocument()
    expect(
      screen.queryByText('Arroz, legumbres y pasta'),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Agua y refrescos')).not.toBeInTheDocument()
  })

  it('should show the sorting options', async () => {
    const responses = {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    }
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    toggleSortingMenu()
    await screen.findByText('By importance')

    expect(screen.getByText('By importance')).toBeInTheDocument()
    expect(screen.getByText('By category')).toBeInTheDocument()
    expect(screen.getByText('By importance')).toHaveFocus()
  })

  it('should hide the sorting options', async () => {
    const responses = {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    }

    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    toggleSortingMenu()
    await screen.findByText('By importance')
    toggleSortingMenu()

    expect(screen.queryByText('By importance')).not.toBeInTheDocument()
  })

  it('should be able to sort the products by category', async () => {
    const responses = {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: manyRecommendations,
    }

    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    toggleSortingMenu()
    selectSortByCategory()

    expect(screen.getByText('Sort By category')).toHaveFocus()
    expect(screen.queryByText('By importance')).not.toBeInTheDocument()
    expect(screen.queryByText('By category')).not.toBeInTheDocument()
    expect(screen.getByText('Arroz, legumbres y pasta')).toBeInTheDocument()
    expect(screen.getByText('Agua y refrescos')).toBeInTheDocument()
  })

  it('should be able to sort the products by importance', async () => {
    const responses = {
      path: '/customers/1/recommendations/myregulars/',
      responseBody: recommendations,
    }
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    toggleSortingMenu()
    selectSortByImportance()

    expect(screen.getByText('Sort By importance')).toHaveFocus()
    expect(screen.queryByText('By importance')).not.toBeInTheDocument()
    expect(screen.queryByText('By category')).not.toBeInTheDocument()
  })

  it('should hide the sorting options clicking out', async () => {
    const responses = [
      {
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      },
    ]
    wrap(App).atPath('/my-products').withNetwork(responses).withLogin().mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    toggleSortingMenu()
    await screen.findByText('By importance')
    clickOut()

    expect(screen.queryByText('By importance')).not.toBeInTheDocument()
    expect(screen.queryByText('By category')).not.toBeInTheDocument()
  })
})

describe('should keep the selected shopping list usage', () => {
  it('should sort by importance by default', async () => {
    localStorage.clear()
    const orderByTimeCategory = JSON.stringify({
      listsOrders: {
        'my-regulars': 'product_sorting_by_category',
      },
    })
    localStorage.setItem('MO-shopping_list_detail', orderByTimeCategory)

    wrap(App)
      .atPath('/my-products')
      .withNetwork({
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      })
      .withLogin()
      .mount()

    expect(await screen.findByText('Sort By category'))
  })

  it('should sort by importance by default', async () => {
    localStorage.clear()
    const orderByTimeCategory = JSON.stringify({
      listsOrders: {
        'my-regulars': 'product_sorting_by_category',
      },
    })

    wrap(App)
      .atPath('/my-products')
      .withNetwork({
        path: '/customers/1/recommendations/myregulars/',
        responseBody: recommendations,
      })
      .withLogin()
      .mount()

    await screen.findByText('Fideos orientales Yakisoba sabor pollo Hacendado')
    toggleSortingMenu()
    selectSortByCategory()

    expect(localStorage.getItem('MO-shopping_list_detail')).toEqual(
      orderByTimeCategory,
    )
  })
})
