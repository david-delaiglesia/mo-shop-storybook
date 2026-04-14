import { screen } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import { pressEnter, tab } from 'pages/helpers'

export const focusOnMyOrderTitle = () => {
  screen.getByText('Products in my order').focus()
}

export const focusOnSearchInput = () => {
  const searchInput = screen.getByRole('searchbox', {
    name: 'Search products',
  })

  searchInput.focus()
}

export const searchProduct = (queryString: string) => {
  const searchInput = screen.getByRole('searchbox', {
    name: 'Search products',
  })

  userEvent.type(searchInput, queryString)
}

export const clickOnSearchResults = () => {
  const searchInput = screen.getByRole('searchbox', {
    name: 'Search products',
  })

  userEvent.click(searchInput)
}

export const tabToBrandFiltersFromCategory = () => {
  tab()
  tab()
  tab()
  tab()
  tab()
  tab()
  tab()
}

export const searchProductsAndNavigateToFilterResults = async () => {
  searchProduct('jam')
  tab()

  const goToFilterResultsButton = await screen.findByText('Filter results')

  tab()
  pressEnter(goToFilterResultsButton)
}

export const expandFirstCategory = () => {
  tab()
  pressEnter()
}

export const waitForCartItemRemovedAnnouncement = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
}
