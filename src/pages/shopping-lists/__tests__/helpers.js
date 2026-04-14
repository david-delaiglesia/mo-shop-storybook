import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

export const navigateToShoppingLists = () => {
  const shoppingListsLink = screen.getByRole('link', { name: 'Lists' })

  userEvent.click(shoppingListsLink)
}

export const navigateToShoppingListDetail = (listName) => {
  userEvent.click(screen.getByText(listName))
}

export const clickOnCreateListButton = () => {
  const createListButton = screen.getByRole('button', { name: 'Create list' })

  userEvent.click(createListButton)
}

export const clickOnCreateNewListButton = () => {
  const createListButton = screen.getByRole('button', {
    name: 'Create new list',
  })

  userEvent.click(createListButton)
}

export const introduceListName = (listName) => {
  const dialog = screen.getByRole('dialog', {
    name: 'Create list, Enter a name for your new list',
  })
  const input = within(dialog).getByLabelText('Name of the list')

  userEvent.type(input, listName)
}

export const confirmListCreation = async () => {
  const dialog = screen.getByRole('dialog', {
    name: 'Create list, Enter a name for your new list',
  })
  const button = within(dialog).getByRole('button', { name: 'Create' })

  await userEvent.click(button)
}

export const confirmListCreationWithEnter = () => {
  const dialog = screen.getByRole('dialog', {
    name: 'Create list, Enter a name for your new list',
  })
  const input = within(dialog).getByLabelText('Name of the list')

  userEvent.type(input, '{enter}')
}

export const cancelListCreation = () => {
  const dialog = screen.getByRole('dialog', {
    name: 'Create list, Enter a name for your new list',
  })
  const button = within(dialog).getByRole('button', { name: 'Cancel' })

  userEvent.click(button)
}

export const navigateToListDetail = () => {
  userEvent.click(screen.getByText('My second list'))
}

export const addProductToCart = (productCell) => {
  const addToCartButton = within(productCell).getByRole('button', {
    name: 'Add 1 unit to cart',
  })

  userEvent.click(addToCartButton)
}

export const navigateToMyEssentialsDetail = () => {
  userEvent.click(screen.getByText('My Essentials'))
}

export const clickIntoOptionsButton = () => {
  userEvent.click(screen.getByRole('button', { name: 'Options' }))
}

export const deleteList = () => {
  userEvent.click(screen.getByRole('button', { name: 'Delete list' }))
}

export const login = () => {
  userEvent.click(screen.getByRole('button', { name: 'Login' }))
}

export const closeErrorDialog = (dialog, buttonText) => {
  const button = within(dialog).getByRole('button', { name: buttonText })

  userEvent.click(button)
}

export const clickOutside = () => {
  userEvent.click(screen.getByRole('heading', { name: 'My second list' }))
}

export const removeProduct = (productDescription) => {
  userEvent.click(screen.getByLabelText(`Remove ${productDescription}`))
}

export const removeProductFromMoreOptions = () => {
  userEvent.click(screen.getByRole('button', { name: 'Remove product' }))
}

export const confirmListDeletion = (dialog) => {
  userEvent.click(within(dialog).getByRole('button', { name: 'Delete list' }))
}

export const cancelListDeletion = (dialog) => {
  userEvent.click(within(dialog).getByRole('button', { name: 'Go back' }))
}

export const confirmErrorDialog = (dialog) => {
  userEvent.click(within(dialog).getByRole('button', { name: 'Understood' }))
}

export const closeModalWithEscapeKey = () => {
  userEvent.keyboard('{Escape}')
}

export const openShoppingListSearchProduct = () => {
  userEvent.click(screen.getByRole('button', { name: 'Search products' }))
}

export const searchShoppingListProduct = (dialog, text = 'milk') => {
  const inputSearch = within(dialog).getByLabelText('Search products')
  userEvent.type(inputSearch, text)
}

export const closeSearchByClickCloseButton = (dialog) => {
  const closeDialogButton = within(dialog).getByRole('button', {
    name: 'Confirm changes and return to list',
  })
  userEvent.click(closeDialogButton)
}

export const clickOutsideDialog = () => {
  userEvent.click(screen.getByTestId('mask'))
}

export const addRecommendedQuantity = () => {
  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })
  userEvent.click(
    within(dialog).getByRole('button', { name: 'Increase 1 Unit quantity.' }),
  )
}

export const addRecommendedQuantityGrams = () => {
  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })
  userEvent.click(
    within(dialog).getByRole('button', {
      name: 'Increase 150 Grams quantity.',
    }),
  )
}

export const reduceRecommendedQuantity = () => {
  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })
  userEvent.click(
    within(dialog).getByRole('button', { name: 'Reduce 1 Unit quantity.' }),
  )
}

export const reduceRecommendedQuantityGrams = () => {
  const dialog = screen.getByRole('dialog', { name: 'Edit quantity' })
  userEvent.click(
    within(dialog).getByRole('button', { name: 'Reduce 150 Grams quantity.' }),
  )
}

export const clickCloseDialog = () => {
  userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
}

const getProduct = async (productName) => {
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  return await within(dialog).findByLabelText(productName)
}

export const addProductToShoppingList = async (productName) => {
  const product = await getProduct(productName)
  const button = within(product).getByRole('button', { name: 'Save' })

  userEvent.click(button)
}

export const removeProductFromSearch = async (productName) => {
  const product = await getProduct(productName)
  const button = within(product).getByRole('button', { name: 'Saved' })

  userEvent.click(button)
}

export const clearSearchText = () => {
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  const inputSearch = within(dialog).getByLabelText('Search products')

  userEvent.clear(inputSearch)
}

export const clickSearchXButton = () => {
  const dialog = screen.getByRole('dialog', { name: 'Search products' })
  const searchCloseElement = within(dialog).getByTestId(
    'search-close-element-id',
  )

  userEvent.click(searchCloseElement)
}

export const clickInMoreActionsButton = (productCell) => {
  userEvent.click(
    within(productCell).getByRole('button', { name: 'more actions' }),
  )
}

export const editQuantity = (productCell) => {
  userEvent.click(
    within(productCell).getByRole('button', { name: 'more actions' }),
  )
  userEvent.click(
    within(productCell).getByRole('button', { name: 'Edit quantity' }),
  )
}

export const saveRecommendedQuantity = (dialog) => {
  userEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
}

export const addToCart = (productCell) => {
  userEvent.click(
    within(productCell).getByRole('button', { name: 'Add 1 unit to cart' }),
  )
}

export const addListToCart = () => {
  userEvent.click(screen.getByRole('button', { name: 'Add all to cart' }))
}

export const acknowledgeDialog = (dialog) => {
  const confirmDialogButton = within(dialog).getByRole('button', {
    name: 'Understood',
  })

  userEvent.click(confirmDialogButton)
}

export const addFirstSuggestionToList = async () => {
  const [saveButton] = screen.getAllByRole('button', { name: 'Save' })

  userEvent.click(saveButton)
}

export const loadMoreSuggestions = () => {
  const loadMoreSuggestionsButton = screen.getByRole('button', {
    name: 'See other suggestions',
  })

  userEvent.click(loadMoreSuggestionsButton)
}

export const openSortingDropdown = () => {
  const selectorDefaultText = screen.getByText('As they were added')
  userEvent.click(selectorDefaultText)
}

export const orderByCategory = () => {
  const selectorDefaultText = screen.getByText('As they were added')
  userEvent.click(selectorDefaultText)

  const selectByCategoryText = screen.getByText('By category')
  userEvent.click(selectByCategoryText)
}

export const orderByTime = () => {
  const selectByCategoryText = screen.getByText('By category')
  userEvent.click(selectByCategoryText)

  const selectorDefaultText = screen.getByText('As they were added')
  userEvent.click(selectorDefaultText)
}

export const closeSearchDialog = () => {
  const closeSearchDialogButton = screen.getByRole('button', {
    name: 'Confirm changes and return to list',
  })

  userEvent.click(closeSearchDialogButton)
}
