import { screen } from '@testing-library/react'

import { search } from './helpers'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { SearchClient } from 'app/search/client'
import { Storage } from 'services/storage'
import { Tracker } from 'services/tracker'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Search', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  afterEach(() => {
    Storage.clear()
    vi.clearAllMocks()
  })

  it('should show the searched products', async () => {
    wrap(App)
      .atPath('/search-results?query=jam')
      .withNetwork()
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)

    expect(screen.getByText('Pizzas y platos preparados')).toBeInTheDocument()
    expect(screen.getByText('Charcutería y quesos')).toBeInTheDocument()
    expect(screen.getByText('Antonio Álvarez')).toBeInTheDocument()
    expect(screen.getByText('Hacendado')).toBeInTheDocument()
    expect(screen.getByText('Jamón serrano Hacendado')).toBeInTheDocument()
    expect(
      screen.getByText('Rosca jamón serrano y queso emmental Hacendado'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Jamón de Trevélez Antonio Álvarez lonchas extra finas'),
    ).toBeInTheDocument()
  })

  it('should search the products from the home', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App).atPath('/').withNetwork(responses).withLogin().mount()

    await screen.findByText('Novedades')
    search('jam')
    await screen.findByText(/Showing 3 results for 'jam'/)

    expect(screen.getByText('Pizzas y platos preparados')).toBeInTheDocument()
    expect(screen.getByText('Charcutería y quesos')).toBeInTheDocument()
    expect(screen.getByText('Antonio Álvarez')).toBeInTheDocument()
    expect(screen.getByText('Hacendado')).toBeInTheDocument()
    expect(screen.getByText('Jamón serrano Hacendado')).toBeInTheDocument()
    expect(
      screen.getByText('Rosca jamón serrano y queso emmental Hacendado'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Jamón de Trevélez Antonio Álvarez lonchas extra finas'),
    ).toBeInTheDocument()
  })

  it('should show no results page', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App)
      .atPath('/search-results?query=empty')
      .withNetwork(responses)
      .withLogin()
      .mount()

    const noResultsMessage = await screen.findByText('There are no results')

    expect(noResultsMessage).toBeInTheDocument()
  })

  it('should scroll to top after a new search', async () => {
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App)
      .atPath('/search-results?query=jam')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)
    search('jamones')
    await screen.findByText(/Showing 3 results for 'jam'/)

    expect(HTMLElement.prototype.scrollTo).toHaveBeenCalledWith(0, 0)
  })

  it('should not trigger a search for an empty search', async () => {
    vi.spyOn(SearchClient, 'search')
    const responses = [
      { path: '/customers/1/home/', responseBody: homeWithGrid },
    ]
    wrap(App)
      .atPath('/search-results?query=jam')
      .withNetwork(responses)
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)
    search('')
    await screen.findByText('Novedades')

    expect(SearchClient.search).toHaveBeenCalledTimes(1)
    expect(SearchClient.search).not.toHaveBeenCalledWith({
      brands: [],
      category: {},
      query: '',
    })
  })

  it('should track the campaign if present as a query param', async () => {
    wrap(App)
      .atPath('/search-results?query=jam&campaign=verano')
      .withNetwork()
      .withLogin()
      .mount()

    await screen.findByText(/Showing 3 results for 'jam'/)

    expect(Tracker.setUserProperties).toHaveBeenCalledWith({
      campaign: 'verano',
    })
  })
})
