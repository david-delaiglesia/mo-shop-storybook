import { screen } from '@testing-library/react'

import {
  clickOnSearchResults,
  expandFirstCategory,
  searchProduct,
  searchProductsAndNavigateToFilterResults,
  tabToBrandFiltersFromCategory,
} from './helpers'
import { beforeEach } from 'vitest'
import { configure, wrap } from 'wrapito'

import { App, history } from 'app'
import { homeWithGrid } from 'app/catalog/__scenarios__/home'
import { addProduct, pressEnter, tab, tabDispatched } from 'pages/helpers'

vi.unmock('react-i18next')
vi.unmock('app/i18n/client')

describe('Search - Product', () => {
  configure({
    changeRoute: (route) => history.push(route),
  })

  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should be able to navigate through category filters with TAB and ENTER', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    searchProduct('jam')
    tab()

    const goToFilterResultsButton = await screen.findByText('Filter results')

    tab()
    pressEnter(goToFilterResultsButton)

    expect(screen.getByText('Category')).toHaveFocus()

    tab()

    const categoryGroup = screen.getByText('Charcutería y quesos')

    pressEnter(categoryGroup)

    expect(categoryGroup.closest('li')).toHaveClass(
      'categories-level-0--selected',
    )
    expect(categoryGroup.closest('button')).toHaveFocus()
  })

  it('should be able to expand Categories with TAB and ENTER', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    await searchProductsAndNavigateToFilterResults()
    expandFirstCategory()

    expect(screen.getByTestId('search-sidebar')).toHaveAttribute(
      'aria-label',
      'Filter results',
    )
    expect(screen.getByTestId('categories-filter')).toHaveAttribute(
      'aria-label',
      'Filter by category',
    )
    expect(screen.getByTestId('brands-filter')).toHaveAttribute(
      'aria-label',
      'Filter by brand',
    )
    expect(
      screen.getByRole('button', { name: 'Charcutería y quesos' }),
    ).toHaveAttribute('aria-expanded', 'true')
  })

  it('should be able to navigate through brand filters with TAB and ENTER and select a brand', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    searchProduct('jam')
    tab()

    const goToFilterResultsButton = await screen.findByText('Filter results')

    tab()
    pressEnter(goToFilterResultsButton)
    tabToBrandFiltersFromCategory()

    expect(screen.getByText('Brand')).toHaveFocus()

    tab()
    pressEnter()

    const brandCheckboxAndLabel = screen.queryAllByRole('checkbox', {
      name: 'Antonio Álvarez',
    })

    expect(brandCheckboxAndLabel[0]).toBeChecked()
    expect(brandCheckboxAndLabel[1]).toBeInTheDocument()
  })

  it('should be able to focus on there are no results after searching and tabbing from search box, if there are no results', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App)
      .atPath('/search-results?query=empty')
      .withNetwork(responses)
      .mount()

    const noResults = await screen.findByText('There are no results')

    searchProduct('jam')
    tabDispatched()

    expect(noResults).toHaveFocus()
  })

  it('should NOT be able to focus on showing results if the search box is empty', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    clickOnSearchResults()
    tab()

    expect(screen.getByText('Categories')).toHaveFocus()
  })

  it('should NOT focus on showing results after adding a Product to cart', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    searchProduct('jam')

    await screen.findByText(/Showing 3 results for 'jam'/)

    addProduct('Jamón serrano Hacendado')

    expect(window.location.search).not.toContain('focus-on-detail=search')
  })

  it('should go to results after clicking in the option after leaving search box', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    searchProduct('jam')
    tab()

    const goToResultsButton = await screen.findByText('Go to results')
    pressEnter(goToResultsButton)

    expect(screen.getByText("Showing 3 results for 'jam'")).toHaveFocus()
  })

  it('should NOT show options menu by pressing Enter after searching from search box', async () => {
    const responses = [{ path: '/home/', responseBody: homeWithGrid }]
    wrap(App).atPath('/').withNetwork(responses).mount()

    await screen.findByText('Novedades')

    searchProduct('jam')
    pressEnter()

    const searchBox = await screen.findByText('Go to results')

    expect(searchBox).not.toHaveFocus()
  })
})
