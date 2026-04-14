import { act, fireEvent, screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

export const typeAddress = (address) => {
  userEvent.type(screen.getByLabelText('Street and number'), address)
}

export const editAddressStreet = (street, options = { blur: false }) => {
  userEvent.type(screen.getByLabelText('Street name'), street)

  if (options.blur) {
    userEvent.tab()
  }
}

export const selectManualAddress = () => {
  userEvent.click(screen.getByText('Add'))
}

export const confirmAgeVerificationAlert = () => {
  userEvent.click(screen.getByText('Yes, I am over 18 years of age'))
}

export const cancelAgeVerificationAlert = () => {
  userEvent.click(screen.getByText('No, check cart'))
}

export const rejectAddPaymentMethod = () => {
  window.cbKo()
}

export const confirmAddPaymentMethod = () => {
  act(window.cbOk)
}

export const onTokenizationError = () => {
  window.cbKo()
}

export const onTokenizationSuccess = () => {
  act(window.cbOk)
}

export const selectPaymentMethod = (selector) => {
  userEvent.click(screen.getByText(selector))
}

export const selectPaymentMethodForSCA = (cardNumber) => {
  const SCAModal = screen.getByRole('dialog')
  userEvent.click(within(SCAModal).getByText(cardNumber).closest('label'))
}

export const savePaymentMethod = () => {
  userEvent.click(screen.getByText('Save'))
}

export const closeModal = () => {
  userEvent.click(screen.getByLabelText('Close'))
}

export function getFirstProductCell() {
  return screen.getAllByTestId('product-cell')[0]
}

export async function openProductDetail(productName) {
  const productCell = getProductCell(productName)

  await act(async () =>
    userEvent.click(within(productCell).getByRole('heading')),
  )
}

export function closeProductDetail() {
  userEvent.click(
    screen.getByRole('button', { name: 'Close product detail dialog' }),
  )
}

export const addProductFromDetail = async () => {
  const productDetail = await screen.findByTestId('private-product-detail')

  userEvent.click(within(productDetail).getByLabelText('Add to cart'))
}

export const increaseProductFromDetail = () => {
  const productDetail = screen.getByTestId('private-product-detail')

  userEvent.click(within(productDetail).getByLabelText(/Add .*? to cart/))
}

export const decreaseProductFromDetail = () => {
  const productDetail = screen.getByTestId('private-product-detail')

  userEvent.click(within(productDetail).getByLabelText(/Remove .*? from cart/))
}

export const addProduct = (productName) => {
  const productCell = getProductCell(productName)

  userEvent.click(within(productCell).getByLabelText('Add to cart'))
}

export const addFirstProduct = () => {
  const [firstProductInList] = screen.getAllByTestId('product-cell')
  const productCell = within(firstProductInList).getByRole('button', {
    name: 'Add to cart',
  })

  userEvent.click(productCell)
}

export const increaseProduct = (productName) => {
  const productCell = getProductCell(productName)

  userEvent.click(within(productCell).getByLabelText(/Add .*? to cart/))
}

export const decreaseProduct = (productName) => {
  const productCell = getProductCell(productName)

  userEvent.click(within(productCell).getByLabelText(/Remove .*? from cart/))
}

export const removeProduct = (productName) => {
  const productCell = getProductCell(productName)

  userEvent.click(
    within(productCell).getByLabelText('Remove product from cart'),
  )
}

export const removeProductFromCart = (productName) => {
  const productCell = getProductCellFromCart(productName)

  userEvent.click(
    within(productCell).getByRole('button', {
      name: 'Remove product from cart',
    }),
  )
}

export const increaseProductFromCart = (productName) => {
  const productCell = getProductCellFromCart(productName)

  userEvent.click(within(productCell).getByLabelText(/Add .*? to cart/))
}

export const decreaseProductFromCart = (productName) => {
  const productCell = getProductCellFromCart(productName)

  userEvent.click(within(productCell).getByLabelText(/Remove .*? from cart/))
}

export function downloadBrowser(browser) {
  userEvent.click(screen.getByText(browser))
}

export function closeCookieConfigurator() {
  const configurator = screen.getByLabelText('Cookie settings')
  userEvent.click(within(configurator).getByText('Close'))
}

export const acceptThirdPartyCookies = () => {
  const checkbox = screen.getByLabelText('Accept analytical cookies')
  userEvent.click(checkbox)
}

export const openTechnicalCookies = () => {
  userEvent.click(screen.getByText('Technical cookies'))
}

export const openThirdPartyCookies = () => {
  userEvent.click(screen.getByText('Analytics'))
}

export const openAnalyticRequiredCookies = () => {
  userEvent.click(screen.getByText('Required analytics'))
}

export const acceptSelectedCookies = (modal) => {
  userEvent.click(within(modal).getByText('Accept'))
}

export const openAccountDropdown = () => {
  const accountDropdown = screen.getByText('Sign in')
  userEvent.click(accountDropdown)
}

export const openLoggedAccountDropdown = () => {
  const accountDropdown = screen.getByRole('button', { name: 'Hello John' })
  userEvent.click(accountDropdown)
}

export const openSignInModal = () => {
  const signInButton = screen.getAllByText('Sign in')[1]
  userEvent.click(signInButton)
}

export const closeSignInModal = () => {
  const cancelButton = screen.getByText('Cancel')
  userEvent.click(cancelButton)
}

export const openProductDetailFromCart = (productName) => {
  const cart = screen.getByRole('complementary', { name: 'Cart' })
  userEvent.click(within(cart).getByLabelText(productName))
}

export const openProductDetailFromCartInEditOrder = (productName) => {
  const cart = screen.getByRole('complementary', {
    name: 'Products in my order',
  })
  userEvent.click(within(cart).getByRole('button', { name: productName }))
}

export const openCart = () => {
  userEvent.click(screen.getByLabelText('Show cart'))
}

export const closeCart = () => {
  userEvent.click(
    screen.getByLabelText('Close cart and continue adding products'),
  )
}

export const closeCleanCartAlert = () => {
  const alert = screen.getByRole('dialog', {
    name: 'Empty cart. Are you sure you want to empty your cart?',
  })
  userEvent.click(within(alert).getByRole('button', { name: 'Cancel' }))
}

export const confirmCleanCartAlert = () => {
  const alert = screen.getByRole('dialog', {
    name: 'Empty cart. Are you sure you want to empty your cart?',
  })
  userEvent.click(within(alert).getByRole('button', { name: 'Empty cart' }))
}

export const confirmMinimumPurchaseAlert = () => {
  const alert = screen.getByRole('dialog', {
    name: 'Minimum order. Remember that to place your order the minimum amount is €50',
  })
  userEvent.click(within(alert).getByRole('button', { name: 'OK' }))
}

export const viewSimilarProducts = (productName) => {
  const productCell = getProductCell(productName)

  userEvent.click(within(productCell).queryByLabelText('View alternatives'))
}

export const viewSimilarProductsFromCart = (productName) => {
  const productCell = getProductCellFromCart(productName)

  userEvent.click(within(productCell).getByLabelText('View alternatives'))
}

export const confirmSimilarProductSubstitution = () => {
  userEvent.click(screen.getByText('Confirm'))
}

export const getProductCell = (productName) => {
  const productCells = screen.getAllByTestId('product-cell')
  const productCell = productCells.find((cell) =>
    within(cell).queryByText(productName),
  )

  return productCell
}

export const getProductCellFromCart = (productName) => {
  const productCells = screen.getAllByTestId('cart-product-cell')
  const productCell = productCells.find((cell) =>
    within(cell).queryByText(productName),
  )

  return productCell
}

export const getAllProductFromCart = () => {
  return screen.getAllByTestId('cart-product-cell')
}

export const goToFAQs = () => {
  userEvent.click(screen.getByText('FAQ'))
}

export const resizeWindowToMobileSize = () => {
  window.matchMedia = vi.fn().mockReturnValue({ matches: false })
  window.dispatchEvent(new Event('resize'))
}

export const closeFailedAuthenticationAlert = () => {
  const button = within(screen.getByRole('dialog')).getByRole('button', {
    name: 'Understood',
  })
  userEvent.click(button)
}

export const createCheckout = () => {
  userEvent.click(screen.getByRole('button', { name: 'Checkout' }))
}

export const openLanguageSelector = () => {
  const languageSelectorButton = screen.getByLabelText('Language selector')
  userEvent.click(languageSelectorButton)
}

export const selectLanguage = (language) => {
  const languageButton = screen
    .getAllByRole('listitem')
    .find((listitem) => listitem.textContent === language)
  userEvent.click(languageButton)
}

export const seeChangesButtonDraftAlert = () => {
  userEvent.click(screen.getByText('See changes'))
}

export const laterButtonDraftAlert = () => {
  userEvent.click(screen.getByText('Later'))
}

export const exitOrder = () => {
  userEvent.click(screen.getByText('Modify order'))
}

export const doubleTab = async () => {
  const modal = await screen.findByRole('dialog')
  userEvent.tab(modal)
  userEvent.tab(modal)
}

export const shiftTabDispatched = () => {
  userEvent.keyboard('{Shift>}{Tab}{/Shift}')
}

export const tab = () => {
  userEvent.tab()
}

export const tabDispatched = () => {
  userEvent.keyboard('{Tab}')
}

export const pressEnter = (element) => {
  if (element) {
    element.focus()
    fireEvent.mouseEnter(element)
  }
  userEvent.keyboard('{Enter}')
}
