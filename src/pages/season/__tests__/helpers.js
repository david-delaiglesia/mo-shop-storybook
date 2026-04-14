import {
  fireEvent,
  getByLabelText,
  screen,
  within,
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'

export const goToMyLists = () => {
  fireEvent.click(screen.getByText('Lists'))
}

export const goToCategories = () => {
  fireEvent.click(screen.getByText('Categories'))
}

export const getFirstProduct = () => {
  return screen.getAllByTestId('product-cell')[0]
}

export const addProductToCart = (productCell) => {
  const addButton = getByLabelText(productCell, 'Add to cart')
  fireEvent.click(addButton)
}

export const removeProduct = (productCell) => {
  fireEvent.click(
    within(productCell).getByRole('button', {
      name: 'Remove product from cart',
    }),
  )
}

export const increaseProductInCart = (productCell) => {
  const increaseProductButton = getByLabelText(productCell, /Add .*? to cart/)
  fireEvent.click(increaseProductButton)
}

export const decreaseProductInCart = (productCell) => {
  const increaseProductButton = getByLabelText(
    productCell,
    /Remove .*? from cart/,
  )
  fireEvent.click(increaseProductButton)
}

export const changeLanguage = (language) => {
  fireEvent.click(screen.getByText('English'))
  fireEvent.click(screen.getByText(language))
}

export const openUserAddress = (postalCode) => {
  const listbox = screen.getByRole('listbox')

  userEvent.click(within(listbox).queryByText(`Delivery in ${postalCode}`))
}
