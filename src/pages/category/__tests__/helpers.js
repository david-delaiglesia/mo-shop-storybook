import { fireEvent, screen, within } from '@testing-library/react'

export const getProductByDisplayName = (productDisplayName) => {
  const productCells = screen.getAllByTestId('product-cell')
  return productCells.find((cell) =>
    cell.textContent.includes(productDisplayName),
  )
}

export const goToNextCategory = (categoryName) => {
  fireEvent.click(screen.getByText(`View ${categoryName}`))
}

export const openCategory = (categoryName) => {
  fireEvent.click(screen.getByText(categoryName))
}

export const openFirstCategory = (categoryName) => {
  fireEvent.click(screen.getByRole('button', { name: categoryName }))
}

export const goToCategories = (container) => {
  const { getByText } = within(container)

  fireEvent.click(getByText('header.menu.categories'))
}

export const goToMyProducts = (container) => {
  const { getByText } = within(container)

  fireEvent.click(getByText('header.menu.my_products'))
}

export const clickOnProductCell = (productCell) => {
  fireEvent.click(productCell)
}
