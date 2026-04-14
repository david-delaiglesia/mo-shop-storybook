import {
  cleanup,
  fireEvent,
  getByText,
  screen,
  within,
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'

export const cancelOrderEdition = () => {
  fireEvent.click(screen.getByText('Cancel'))
}

export const confirmOrderEdition = () => {
  fireEvent.click(screen.getByText('Save changes'))
}

export const searchProducts = (product) => {
  const input = screen.getByLabelText('Search products')
  fireEvent.change(input, { target: { name: 'search', value: product } })
}

export const openProductDetail = (container, productName) => {
  fireEvent.click(getByText(container, productName))
}

export const stayInEditOrderProduct = () => {
  fireEvent.click(screen.getByText('Stay'))
}

export const goToOrderDetailWithoutChanges = () => {
  fireEvent.click(screen.getByText('Exit without saving'))
}

export const closeTab = () => {
  window.dispatchEvent(new Event('beforeunload'))
  window.dispatchEvent(new Event('unload'))
}

export const openCategory = (category) => {
  fireEvent.click(screen.getByText(category))
}

export const openMyRegulars = () => {
  const [element] = screen.queryAllByText('My Essentials')
  fireEvent.click(element)
}

export const selectCategories = () => {
  fireEvent.click(screen.getByText('Categories'))
}

export const selectSubcategory = (subcategoryName) => {
  fireEvent.click(screen.getByText(subcategoryName))
}

export const openCategoryMenu = () => {
  fireEvent.click(screen.getByText('Categories'))
}

export const closeCategoryMenu = () => {
  fireEvent.click(screen.getByText('Categories'))
}

export const goToNextCategory = (categoryName) => {
  fireEvent.click(screen.getByText(`View ${categoryName}`))
}

export const setOnline = () => {
  const online = new Event('online')
  window.dispatchEvent(online)
}

export const seeAllProducts = () => {
  fireEvent.click(screen.getByText('View all the products'))
}

export const incrementProductInCart = async () => {
  await fireEvent.click(screen.getAllByLabelText(/Add .*? to cart/)[0])
}

export const retrySCA = () => {
  const authModal = screen.getByRole('dialog')
  const continueButton = within(authModal).getByRole('button', {
    name: 'Continue',
  })
  userEvent.click(continueButton)
}

export const scaChallengeSuccess = (mountFn) => {
  cleanup()
  window.history.replaceState = vi.fn(() => {
    vi.spyOn(window.history, 'state', 'get').mockReturnValue()
  })
  vi.spyOn(window.history, 'state', 'get').mockReturnValue({
    source: 'SCA_CONFIRM',
    status: 'SUCCESS',
  })
  mountFn()
}

export const scaChallengeError = (mountFn) => {
  vi.clearAllMocks()
  cleanup()
  window.history.replaceState = vi.fn(() => {
    vi.spyOn(window.history, 'state', 'get').mockReturnValue()
  })
  vi.spyOn(window.history, 'state', 'get').mockReturnValue({
    source: 'SCA_CONFIRM',
    status: 'ERROR',
  })
  mountFn()
}

export const tokenizationChallengeSuccess = (mountFn) => {
  vi.clearAllMocks()
  cleanup()
  window.history.replaceState = vi.fn(() => {
    vi.spyOn(window.history, 'state', 'get').mockReturnValue({})
  })
  vi.spyOn(window.history, 'state', 'get').mockReturnValue({
    source: 'SCA_ADDED_PAYMENT',
    status: 'SUCCESS',
  })
  mountFn()
}

export const changePaymentScaChallengeSuccess = (mountFn) => {
  cleanup()
  window.history.replaceState = vi.fn(() => {
    vi.spyOn(window.history, 'state', 'get').mockReturnValue({})
  })
  vi.spyOn(window.history, 'state', 'get').mockReturnValue({
    source: 'SCA_UPDATE_PAYMENT',
    status: 'SUCCESS',
  })
  mountFn()
}

export const closeSCAWithoutSaving = () => {
  fireEvent.click(screen.getByText('Close without saving changes'))
}

export const closeSCAWithoutSavingCheckout = () => {
  fireEvent.click(screen.getByText('Close'))
}

export const tryAnotherPaymentMethod = () => {
  const errorModal = screen.getByRole('dialog')
  const tryAgainButton = within(errorModal).getByRole('button', {
    name: 'Try again',
  })
  userEvent.click(tryAgainButton)
}

export const selectPaymentMethod = (paymentMethod) => {
  fireEvent.click(screen.getByText(paymentMethod))
}

export const addNewPaymentMethod = () => {
  fireEvent.click(screen.getByText('Add new card for this order'))
}

export const cancelChangePayment = () => {
  const dialog = screen.getByRole('dialog')
  fireEvent.keyDown(dialog, { key: 'Escape', code: 'Escape' })
}

export const authorizeMIT = () => {
  fireEvent.click(screen.getByText('Authorise'))
}

export const openProductDetailFromCart = (productName) => {
  const editOrderCart = screen.getByRole('complementary', {
    name: 'Products in my order',
  })
  fireEvent.click(within(editOrderCart).getByLabelText(productName))
}

export const openSortingDropdown = () => {
  const cart = screen.getByRole('complementary', {
    name: 'Products in my order',
  })
  const sortingDropDown = within(cart).getByText('As they were added')
  fireEvent.click(sortingDropDown)
}

export const closeBlinkingProductAlert = () => {
  const modal = screen.getByRole('dialog', {
    name: 'It is not possible to add the product. This product will not be available the day you receive your order.',
  })

  userEvent.click(within(modal).getByRole('button', { name: 'OK' }))
}
export const modifyConfirmedOrder = () => {
  userEvent.click(
    screen.getByRole('link', {
      name: 'Modify',
    }),
  )
}

export const cancelRemoveOrder = (alert) => {
  userEvent.click(within(alert).getByRole('button', { name: 'Go back' }))
}

export const acceptRemoveOrder = (alert) => {
  userEvent.click(within(alert).getByRole('button', { name: 'Cancel order' }))
}

export const addRecommendedQuantityToCart = (text) => {
  userEvent.click(screen.getByRole('button', { name: text }))
}

export const displayShoppingLists = () => {
  userEvent.click(screen.getByRole('link', { name: 'Lists' }))
}

export const clickOutsideTheShoppingListAside = () => {
  userEvent.click(screen.getByText('Products in my order'))
}

export const navigateToShoppingListDetail = async () => {
  userEvent.click(await screen.findByText('My first list'))
}

export const navigateToMyRegulars = async () => {
  userEvent.click(screen.getByText('My Essentials'))
}

export const openFirstProductDetail = () => {
  const [firstProductInList] = screen.getAllByTestId('product-cell')
  const [productDetailButton] =
    within(firstProductInList).getAllByRole('button')

  userEvent.click(productDetailButton)
}

export const clickOnElement = (element) => {
  userEvent.click(element)
}
