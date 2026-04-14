import { fireEvent, screen, within } from '@testing-library/react'

export const getProductCellByDisplayName = (container, productDisplayName) => {
  const { getAllByTestId } = within(container)

  const productCells = getAllByTestId('product-cell')
  return productCells.find((cell) =>
    cell.textContent.includes(productDisplayName),
  )
}

export const closeSimilarProductsDialog = () => {
  const dialog = screen.getByRole('dialog')
  fireEvent.click(within(dialog).getAllByLabelText('Close')[0])
}

export const closeNoSimilarProductsAlert = () => {
  fireEvent.click(screen.getByText('OK'))
}

export const closeModalByText = (modal, closeModalText) => {
  const { getByText } = within(modal)

  fireEvent.click(getByText(closeModalText))
}

export const closeModalByAriaLabel = (modal, closeModalText) => {
  const { getByLabelText } = within(modal)

  fireEvent.click(getByLabelText(closeModalText))
}

export const getProductByDisplayName = (container, productDisplayName) => {
  const { getAllByTestId } = within(container)

  const productCells = getAllByTestId('product-cell')
  return productCells.find((cell) =>
    cell.textContent.includes(productDisplayName),
  )
}

export const addProductToCart = (productCell) => {
  const { getByText } = within(productCell)

  const addToCartButton = getByText('commons.product.add_to_cart')
  fireEvent.click(addToCartButton)
}

export const goToCategories = () => {
  fireEvent.click(screen.getByText('Categories'))
}

export const addProductRecommendation = (productName) => {
  const productCells = screen.getAllByTestId('product-cell')
  const productCell = productCells.find((cell) =>
    cell.textContent.includes(productName),
  )

  const unitsProduct = within(productCell).queryByText(/Add \d+ units?/)
  const packProduct = within(productCell).queryByText(/Add \d+ packs?/)
  const bulkProduct = within(productCell).queryByText(/Add \d+ g/)

  fireEvent.click(unitsProduct || bulkProduct || packProduct)
}

export const increaseProductInCart = (container) => {
  const { getByLabelText } = within(container)

  fireEvent.click(getByLabelText(/Add .*? to cart/))
}
export const decreaseProductInCart = (container) => {
  const { getByLabelText } = within(container)

  fireEvent.click(getByLabelText(/Remove .*? from cart/))
}

export const openProductDetail = (productDisplayName) => {
  fireEvent.click(screen.getByText(productDisplayName))
}

export const selectMyRegularsList = (listName) => {
  fireEvent.click(screen.getByText(listName))
}

export const seeAllProducts = () => {
  fireEvent.click(screen.getByText('View all the products'))
}

export const removeProduct = (productName) => {
  fireEvent.click(
    screen.getByLabelText(`Remove ${productName} from my regular products`),
  )
}

export const confirmRemoveProduct = () => {
  fireEvent.click(screen.getByText('Remove product'))
}

export const closeRemoveProductModal = () => {
  fireEvent.click(screen.getByText('Cancel'))
}

export const toggleSortingMenu = () => {
  fireEvent.click(screen.getByText(/Sort/))
}

export const selectSortByCategory = () => {
  fireEvent.click(screen.getByText('By category'))
}

export const selectSortByImportance = () => {
  fireEvent.click(screen.getByText('By importance'))
}

export const clickOut = () => {
  fireEvent.click(screen.getByRole('heading', { name: 'My Essentials' }))
}

export const openSignIn = () => {
  fireEvent.click(screen.getByText('Login'))
}

export const goBackToAlternatives = () => {
  fireEvent.click(screen.getByText('Back to alternatives'))
}
