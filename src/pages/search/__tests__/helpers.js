import { fireEvent, screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

export function filterByBrand(brand) {
  const brandFilter = screen.getByLabelText(brand)
  fireEvent.click(brandFilter)
}

export function filterByCategory(category) {
  const categoryFilter = screen.getByText(category)
  fireEvent.click(categoryFilter)
}

export function search(text) {
  const searchInput = screen.getByLabelText('Search products')
  fireEvent.change(searchInput, { target: { value: text } })
}

export const getFirstProduct = (container) => {
  const { getAllByTestId } = within(container)
  const productCells = getAllByTestId('product-cell')

  return productCells[0]
}

export const addProductToCart = (productCell) => {
  const { getByLabelText } = within(productCell)

  const addButton = getByLabelText('commons.product.add_to_cart')
  fireEvent.click(addButton)
}

export const increaseProductInCart = (productCell) => {
  const { getByLabelText } = within(productCell)

  const increaseProductButton = getByLabelText(/Add .*? to cart/)
  fireEvent.click(increaseProductButton)
}

export const decreaseProductInCart = (productCell) => {
  const { getByLabelText } = within(productCell)

  const decreaseProductButton = getByLabelText('commons.product.decrease')
  fireEvent.click(decreaseProductButton)
}

export const openProductModal = (product) => {
  const { getAllByRole } = within(product)

  const openModalButton = getAllByRole('button').find(
    (button) => !button.textContent.includes('add_to_cart'),
  )

  fireEvent.click(openModalButton)
}

const selectCategory = (category) => {
  userEvent.click(screen.getByText(category))
}

const selectBrand = (brand) => {
  userEvent.click(screen.getByLabelText(brand))
}

export const clickOnLensIcon = () => {
  userEvent.click(screen.getByTestId('search-lens-element-id'))
}

export { selectCategory, selectBrand }
