import { screen } from '@testing-library/react'

import { filterByBrand, filterByCategory } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Search - Filter', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Storage.clear()
    vi.clearAllMocks()
  })

  it('should filter by brand', async () => {
    wrap(App)
      .atPath('/search-results?query=jam')
      .withNetwork()
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)
    filterByBrand('Hacendado')
    await screen.findByText(/Showing 2 results for 'jam'/)

    expect(screen.getByText('Pizzas y platos preparados')).toBeInTheDocument()
    expect(screen.getByText('Charcutería y quesos')).toBeInTheDocument()
    expect(screen.getByText('Antonio Álvarez')).toBeInTheDocument()
    expect(screen.getByText('Hacendado')).toBeInTheDocument()
    expect(screen.getByText('Jamón serrano Hacendado')).toBeInTheDocument()
    expect(
      screen.getByText('Rosca jamón serrano y queso emmental Hacendado'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Jamón de Trevélez Antonio Álvarez lonchas extra finas',
      ),
    ).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith('facets_brand_click', {
      name: 'Hacendado',
      text: 'jam',
      count: 3,
    })
  })

  it('should filter by category', async () => {
    wrap(App)
      .atPath('/search-results?query=jam')
      .withNetwork()
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)
    filterByCategory('Pizzas y platos preparados')
    await screen.findByText(/Showing 1 results for 'jam'/)

    expect(screen.getByText('Pizzas y platos preparados')).toBeInTheDocument()
    expect(screen.getByText('Charcutería y quesos')).toBeInTheDocument()
    expect(screen.queryByText('Antonio Álvarez')).not.toBeInTheDocument()
    expect(screen.getByText('Hacendado')).toBeInTheDocument()
    expect(
      screen.queryByText('Jamón serrano Hacendado'),
    ).not.toBeInTheDocument()
    expect(
      screen.getByText('Rosca jamón serrano y queso emmental Hacendado'),
    ).toBeInTheDocument()
    expect(
      screen.queryByText(
        'Jamón de Trevélez Antonio Álvarez lonchas extra finas',
      ),
    ).not.toBeInTheDocument()
    expect(Tracker.sendInteraction).toHaveBeenCalledWith(
      'facets_category_click',
      {
        name: 'Pizzas y platos preparados',
        text: 'jam',
        count: 3,
        level: 0,
      },
    )
  })
})
