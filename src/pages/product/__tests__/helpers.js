import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

export const fillPostalCode = (postalCode) => {
  userEvent.type(screen.getByLabelText('Postal code'), postalCode)
}

export const confirmPostalCode = () => {
  userEvent.click(screen.getByLabelText('Enter'))
}

export const shareProduct = () => {
  userEvent.click(screen.getByText('Share'))
}

export const goToProductCategories = (productBreadcrumb) => {
  userEvent.click(screen.getByText(productBreadcrumb).closest('a'))
}

export const addPrivateProductToCart = () => {
  userEvent.click(screen.getByText('Add to cart'))
}

export const increasePrivateProductInCart = () => {
  userEvent.click(screen.getAllByLabelText(/Add .*? to cart/)[0])
}

export const decreasePrivateProductInCart = () => {
  userEvent.click(screen.getAllByLabelText(/Remove .*? from cart/)[0])
}

export const removePrivateProductInCart = () => {
  userEvent.click(screen.getAllByLabelText('Remove product from cart')[0])
}

export const addXsellingProductToCart = () => {
  userEvent.click(screen.getAllByText('Add to cart')[1])
}

export const increaseXsellingProductToCart = () => {
  userEvent.click(screen.getAllByLabelText(/Add .*? to cart/)[1])
}

export const decreaseXsellingProductToCart = () => {
  userEvent.click(screen.getAllByLabelText(/Remove .*? from cart/)[1])
}

export const removeXsellingProductFromCart = () => {
  userEvent.click(screen.getAllByLabelText('Remove product from cart')[0])
}

export const seeNextProductImage = () => {
  userEvent.click(screen.getByLabelText('next-related-products-page'))
}

export const setHightResolution = () => {
  Element.prototype.getBoundingClientRect = vi.fn(() => {
    return {
      width: 1200,
      height: 2000,
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    }
  })
}

export const doFocusOnProduct = () => {
  userEvent.click(screen.getByTestId('image-zoomer-overlay-image'))
}

export const shareProductLink = () => {
  const link = screen.getByRole('link', {
    name: 'Share',
  })

  within(link).getByRole('img', {
    hidden: true,
  })
  userEvent.click(link)
}

export const addProductToList = () => {
  userEvent.click(screen.getByRole('button', { name: 'Save in lists' }))
}

export const closeAddProductToListDialog = () => {
  userEvent.click(screen.getByRole('button', { name: 'Close modal' }))
}

export const selectListFromDialog = async () => {
  const dialog = screen.getByRole('dialog', { name: 'Save in a list' })
  const listToSelect = await within(dialog).findByText('Some user list')

  userEvent.click(listToSelect)
}

export const addProductToNewList = (dialog) => {
  userEvent.click(within(dialog).getByRole('button', { name: 'New list' }))
}
