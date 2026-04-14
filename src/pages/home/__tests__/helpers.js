import {
  fireEvent,
  getByTestId,
  getByText,
  screen,
  within,
} from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import { history } from 'app'

export const getProductByDisplayName = (container, productDisplayName) => {
  const { getAllByTestId } = within(container)

  const productCells = getAllByTestId('product-cell')
  return productCells.find((cell) =>
    cell.textContent.includes(productDisplayName),
  )
}

export const getProductCellByDisplayName = (productDisplayName) => {
  const productCells = screen.getAllByTestId('product-cell')
  return productCells.find((cell) =>
    cell.textContent.includes(productDisplayName),
  )
}

export const addProductToCart = (productCell) => {
  const { getByText } = within(productCell)

  fireEvent.click(getByText('Add to cart'))
}

export const continueAddingProductToCart = () => {
  screen.getByRole('button', { name: 'Add 1 Unit to cart' })
}

export const decreaseProductFromCart = (productCell) => {
  const { getByLabelText } = within(productCell)

  fireEvent.click(getByLabelText(/Remove .*? from cart/))
}

export const addProductToCartWithFocus = (productCell) => {
  const { getByText } = within(productCell)

  const addToCartButton = getByText('Add to cart')
  window.dispatchEvent(new Event('focus'))
  fireEvent.click(addToCartButton)
}

export const addProductToCartFromDetail = (productDetail) => {
  const privateProductDetailInfo = within(productDetail).getByTestId(
    'private-product-detail-info',
  )

  fireEvent.click(
    within(privateProductDetailInfo).getByRole('button', {
      name: 'Add to cart',
    }),
  )
}

export const increaseProductInCart = (productCell) => {
  const { getByLabelText } = within(productCell)

  fireEvent.click(getByLabelText(/Add .*? to cart/))
}

export const closeModalByText = (container, closeModalText) => {
  const { getByText } = within(container)

  fireEvent.click(getByText(closeModalText))
}

export const clickOnHelpBanner = () => {
  fireEvent.click(screen.getByText('View'))
}

export const decreaseProductInCart = (productCell) => {
  const { getByLabelText } = within(productCell)

  fireEvent.click(getByLabelText(/Remove .*? from cart/))
}

export const removeProductFromCart = (productCell) => {
  const { getByRole } = within(productCell)

  fireEvent.click(getByRole('button', { name: 'Remove product from cart' }))
}

//TODO deprecate this selector as it is too complicated
//use openProductDetailSimplified instead
export const openProductDetail = (container, productName) => {
  fireEvent.click(getByText(container, productName))
}

export const openProductDetailSimplified = (productDetail) => {
  fireEvent.click(productDetail)
}

export const simulateBackNavigation = () => history.push('/')

export const closeWaterLimitAlert = () => {
  fireEvent.click(screen.getByText('OK'))
}

export const closeGenericAlert = () => {
  fireEvent.click(screen.getByText('OK'))
}

export const confirmToAddAlternativeProducts = () => {
  fireEvent.click(screen.getByText('Confirm'))
}

export const addAlternativeProduct = (productName) => {
  const similarModal = screen.getByRole('dialog')
  const alternativeProduct = getProductByDisplayName(similarModal, productName)

  addProductToCart(alternativeProduct)
}

export const decreaseAlternativeProduct = (productName) => {
  const similarModal = screen.getByRole('dialog')
  const alternativeProduct = getProductByDisplayName(similarModal, productName)

  decreaseProductInCart(alternativeProduct)
}

export const goToHome = () => {
  userEvent.click(
    screen.getByRole('button', {
      name: 'Home',
    }),
  )
}

export const goToCategories = () => {
  fireEvent.click(screen.getByText('Categories'))
}

export const goToBannerProducts = () => {
  fireEvent.click(screen.getByText('View products').closest('a'))
}

export const acceptCookies = () => {
  fireEvent.click(screen.getByText('Accept'))
}

export const rejectCookies = () => {
  fireEvent.click(screen.getByText('Reject'))
}

export const openCart = () => {
  userEvent.click(screen.getByLabelText('Show cart'))
}

export const closeCart = () => {
  fireEvent.click(screen.getByTestId('overlay'))
}

export const setPostalCode = (postalCode) => {
  const input = screen.getByRole('textbox', { name: 'Postal code' })

  userEvent.clear(input)
  userEvent.type(input, postalCode)
}

export const acceptOnboardingModal = () => {
  fireEvent.click(screen.getByText('Continue'))
}
export const startCheckout = () => {
  fireEvent.click(screen.getByText('Checkout'))
}

export const doFocus = () => {
  fireEvent.focus(window)
}

export const setOnline = () => {
  const online = new Event('online')
  window.dispatchEvent(online)
}

export const setOffline = () => {
  const offline = new Event('offline')
  window.dispatchEvent(offline)
}

export const openChangeAddressModal = (postalCode) => {
  fireEvent.click(screen.queryByText(`Delivery in ${postalCode}`))
}

export const selectInputAddress = () => {
  fireEvent.click(screen.getByLabelText('Street and number'))
}

export const openUserDropdown = () => {
  fireEvent.click(screen.getByText('Sign in'))
}

export const openUserMenu = (name) => {
  fireEvent.click(screen.getByText(`Hello ${name}`))
}

export const fillPostalCodeForm = (postalCode) => {
  const event = { target: { name: 'postalCode', value: postalCode } }
  fireEvent.change(screen.queryByLabelText('Postal code'), event)
}

export const clickOnPostalCode = (postalCode) => {
  userEvent.click(screen.getByText(postalCode))
}

export const confirmPostalCodeForm = () => {
  const dialog = screen.getByRole('dialog')
  userEvent.click(within(dialog).getByRole('button', { name: 'Change' }))
}

export const goToOldWebsite = () => {
  userEvent.click(
    screen.getByRole('button', {
      name: 'Go to classic version',
    }),
  )
}

export const confirmPostalCodeFormPressingEnter = () => {
  const dialog = screen.getByRole('dialog')
  const input = within(dialog).getByRole('textbox', { name: 'Postal code' })
  userEvent.type(input, '{enter}')
}

export const cancelPostalCodeForm = () => {
  const dialog = screen.getByRole('dialog')
  userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }))
}

export const confirmAddressForm = () => {
  fireEvent.click(screen.getByText('Accept'))
}

export const saveAddressForm = () => {
  fireEvent.click(screen.getByText('Save'))
}

export const selectAddressFromList = (address) => {
  fireEvent.click(screen.getByText(address))
}

export const addNewAddress = () => {
  fireEvent.click(screen.getByText('Add address'))
}

export const addCartToOngoingOrder = () => {
  userEvent.click(screen.getByText('Add to current order'))
}

export const createNewOrder = () => {
  fireEvent.click(screen.getByText('Confirm new order'))
}

export const confirmChangeHiveAlert = () => {
  fireEvent.click(screen.getByText('Ok'))
}

export const goBackToCart = () => {
  fireEvent.click(screen.getByText('Back to cart'))
}

export const cancelQuantityProductLimitAlert = () => {
  fireEvent.click(screen.getByText('Back to cart'))
}

export const confirmQuantityProductLimitAlert = () => {
  fireEvent.click(screen.getByText('Accept'))
}

export const goToPlayStore = async () => {
  const openPlayStoreLink = screen.getByAltText('Abrir App en Play Store')
  openPlayStoreLink.addEventListener('click', (e) => e.preventDefault())

  fireEvent.click(openPlayStoreLink)
}

export const goToAppStore = () => {
  fireEvent.click(screen.getByAltText('Abrir App en App Store'))
}

export const openCookieConfiguration = () => {
  fireEvent.click(screen.getByText('Settings'))
}

export const openSortingDropdown = () => {
  const cart = screen.getByRole('complementary')
  const sortingDropDown = getByTestId(cart, 'dropdown-button')
  fireEvent.click(sortingDropDown)
}

export const sortByCategory = () => {
  fireEvent.click(screen.getByText('By category'))
}

export const sortByTime = () => {
  fireEvent.click(screen.getByText('As they were added'))
}

export const goToPendingOrderDetail = () => {
  fireEvent.click(screen.getByText('See order'))
}

export const goToPendingOrderDetailFromCard = (orderId) => {
  fireEvent.click(screen.queryByText(`Order ${orderId}`))
}

export const goToEditOrder = async () => {
  await fireEvent.click(screen.getByText('Modify'))
}

export const goToCarouselDetail = () => {
  userEvent.click(
    screen.getByRole('link', {
      name: 'Ver todas las novedades',
    }),
  )
}

export const changeLanguage = (language) => {
  fireEvent.click(screen.getByText('English'))
  fireEvent.click(screen.getByText(language))
}

export const selectSecondImage = (productName) => {
  const [, secondImage] = screen.getAllByLabelText(
    `Thumbnail image of the product ${productName}`,
  )
  fireEvent.click(secondImage)
}

export const downloadTicket = () => {
  fireEvent.click(screen.getByText('See ticket'))
}

export const rateOrder = () => {
  fireEvent.click(screen.getByText('Rate'))
}

export const openChat = () => {
  fireEvent.click(screen.getByText('Chat'))
}

export const showNextWidget = () => {
  fireEvent.click(screen.getByLabelText('Next order card'))
}

export const closeModal = () => {
  fireEvent.click(screen.getByLabelText('Close'))
}

export const closeProductModal = () => {
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Close product detail dialog',
    }),
  )
}

export const downloadUpdateBrowser = () => {
  fireEvent.click(screen.getByText('old_browser_banner_download_link'))
}

export const pressTabKey = () => {
  userEvent.tab()
}

export const pressVOKey = (key) => {
  userEvent.keyboard('{control>}{alt>}' + key)
}

export const pressSpaceKey = () => {
  userEvent.keyboard('{Space}')
}

export const pressEnterKey = () => {
  userEvent.keyboard('{Enter}')
}

export const confirmForceUpdate = () => {
  fireEvent.click(screen.getByText('Refresh'))
}

export const openChangeAddressModalFromUserMenu = (postalCode) => {
  const { getByText } = within(screen.getByRole('listbox'))
  const button = getByText(`Delivery in ${postalCode}`)

  fireEvent.click(button)
}

export const openLoggedUserDropdown = (username) => {
  fireEvent.click(screen.getByText(`Hello ${username}`))
}

export const seeNextBannerWithArrow = () => {
  userEvent.click(screen.getByLabelText('arrow--right'))
}

export const seePreviousBannerWithArrow = () => {
  userEvent.click(screen.getByLabelText('arrow--left'))
}

export const seeFirstBannerWithBottomControl = () => {
  userEvent.click(screen.getByTestId('banner-index-0'))
}

export const seeSecondBannerWithBottomControl = () => {
  userEvent.click(screen.getByTestId('banner-index-1'))
}

export const resizeWindow = () => {
  window.dispatchEvent(new Event('resize'))
}

export const useMouse = () => {
  userEvent.click(screen.getByLabelText('Search products'))
}

export const closeCartClickingOutside = () => {
  userEvent.click(screen.getByTestId('overlay'))
}

export const closeWhatsNewModal = () => {
  userEvent.click(screen.getByRole('button', { name: 'Understood' }))
}

export const confirmAgeVerificationAlert = () => {
  const ageVerificationAlert = screen.getByRole('dialog')
  const confirmButton = within(ageVerificationAlert).getByRole('button', {
    name: 'Yes, I am over 18 years of age',
  })
  userEvent.click(confirmButton)
}

export const cancelAgeVerificationAlert = () => {
  const ageVerificationAlert = screen.getByRole('dialog')
  const closeButton = within(ageVerificationAlert).getByRole('button', {
    name: 'No, check cart',
  })
  userEvent.click(closeButton)
}

export const cancelBlinkingProductMerge = () => {
  const modal = screen.getByRole('dialog')

  userEvent.click(
    within(modal).getByRole('button', {
      name: 'Cancel',
    }),
  )
}

export const continueBlinkingProductMerge = () => {
  const modal = screen.getByRole('dialog')
  userEvent.click(
    within(modal).getByRole('button', {
      name: 'Continue',
    }),
  )
}

export const confirmWarehouseChangedModal = () => {
  userEvent.click(
    screen.getByRole('button', {
      name: 'Check your shopping trolley',
    }),
  )
}

export const confirmChangeOfAddressModal = () => {
  userEvent.click(
    screen.getByRole('button', {
      name: 'Return to shopping trolley',
    }),
  )
}

export const clickOnCategory = () => {
  userEvent.click(
    screen.getByRole('link', {
      name: 'Categories',
    }),
  )
}

export const clickOnHighlightedBanner = () => {
  userEvent.click(
    screen.getByRole('button', {
      name: 'Fideos orientales Yakisoba sabor pollo Hacendado, Paquete, 90 Grams, 0,85€ per Unit',
    }),
  )
}

export const clickOnHighlightedBannerProductPrice = () => {
  const bannerProduct = screen.getByLabelText(
    'Fideos orientales Yakisoba sabor pollo Hacendado',
  )

  userEvent.click(within(bannerProduct).getByText('0,85 €'))
}

export const openCartActionsMenu = () => {
  const cartAside = screen.getByLabelText('Cart')
  const moreActionsButton = within(cartAside).getByRole('button', {
    name: 'more actions',
  })
  userEvent.click(moreActionsButton)
}

export const emptyCart = () => {
  return userEvent.click(
    screen.getByRole('button', {
      name: 'Empty cart',
    }),
  )
}

export const clickOnSaveToNewListButton = () => {
  return userEvent.click(
    screen.getByRole('button', {
      name: 'Save to new list',
    }),
  )
}

export const clickOnDismissCreateListDialog = () => {
  return userEvent.click(
    screen.getByRole('button', {
      name: 'Cancel',
    }),
  )
}

export const clickOnCreateListButton = () => {
  return userEvent.click(
    screen.getByRole('button', {
      name: 'Create',
    }),
  )
}

export const typeListName = (listName) => {
  const listNameInput = screen.getByRole('textbox', {
    name: 'Name of the list',
  })
  userEvent.type(listNameInput, listName)
}

export const clickOutsideMoreActionsMenu = () => {
  userEvent.click(screen.getByText('Cart'))
}

export const closePopoverDialog = () => {
  userEvent.click(screen.getByRole('button', { name: 'Close' }))
}

export const navigateToShoppingLists = () => {
  userEvent.click(screen.getByRole('button', { name: 'Go to lists' }))
}

export const acceptDialog = () => {
  userEvent.click(screen.getByRole('button', { name: 'Understood' }))
}

export const openHelpDeskChatWithPendingMessages = (pendingMessages) => {
  userEvent.click(
    screen.getByRole('button', {
      name: `Open chat. You have ${pendingMessages} unread messages`,
    }),
  )
}

export const openHelpDeskChat = () => {
  userEvent.click(screen.getByRole('button', { name: /Open chat/i }))
}

export const minimizeHelpDeskChatWithFloatingButton = () => {
  userEvent.click(
    screen.getByRole('button', { name: 'Minimise chat', expanded: true }),
  )
}

export const minimizeHelpDeskChatWithHeaderButton = () => {
  const helpDeskChat = screen.getByLabelText('Customer service')
  const header = within(helpDeskChat).getByRole('banner')
  userEvent.click(
    within(header).getByRole('button', {
      name: 'Minimise chat',
    }),
  )
}

export const openPrivacyPolicyFromHelpDeskChat = () => {
  const helpDeskChat = screen.getByLabelText('Customer service')
  const conversation = within(helpDeskChat).getByRole('log')
  userEvent.click(
    within(conversation).getByRole('link', { name: 'Privacy Policy' }),
  )
}

export const continueHelpDeskChat = () => {
  userEvent.click(screen.getByRole('button', { name: 'Continue my inquiry' }))
}

export const openContextualOptions = () => {
  userEvent.click(screen.getByRole('button', { name: 'More options' }))
}

export const generateFile = ({ name, extension, size = 1048576 }) => {
  const sizeInBytes = size
  const file = new File(['(⌐□_□)'], `${name}.${extension}`, {
    type: 'image/jpg',
  })
  Object.defineProperty(file, 'size', { value: sizeInBytes })
  return file
}

export const closeHelpDeskChatFromContextualMenu = () => {
  const contextualMenu = screen.getByRole('menu')
  userEvent.click(
    within(contextualMenu).getByRole('menuitem', { name: 'End chat' }),
  )
}

export const closeHelpDeskChat = () => {
  userEvent.click(screen.getByRole('button', { name: 'End chat' }))
}

export const finishHelpDeskChat = () => {
  userEvent.click(screen.getByRole('button', { name: 'End conversation' }))
}

export const clearMessageHelpDeskChat = () => {
  userEvent.clear(screen.getByLabelText('message for the chat'))
}

export const writeMessageHelpDeskChat = (message) => {
  userEvent.type(screen.getByLabelText('message for the chat'), message)
}

export const sendMessageToHelDeskChatWithButton = () => {
  userEvent.click(screen.getByRole('button', { name: 'Send message' }))
}

export const sendMessageToHelDeskChatWithKeyboard = () => {
  userEvent.type(screen.getByLabelText('message for the chat'), '{enter}')
}

export const userClickOutsideChat = () => {
  userEvent.click(screen.getByRole('button', { name: 'Home' }))
}

export const retryErrorMessageHelpDeskChat = () => {
  userEvent.click(screen.getByRole('button', { name: 'Try sending again' }))
}

export const tabOnwards = () => {
  userEvent.tab()
}

export const tabBackwards = () => {
  userEvent.tab({ shift: true })
}

export const scrollMessagesUp = (scrollContainer, scrollTop = 0) => {
  Object.defineProperties(scrollContainer, {
    scrollHeight: { value: 1000, configurable: true },
    clientHeight: { value: 500, configurable: true },
    scrollTop: { value: scrollTop, configurable: true, writable: true },
  })

  fireEvent.scroll(scrollContainer)
}

export const dragFileOverChat = (chatElement, file) => {
  fireEvent.dragEnter(chatElement, {
    dataTransfer: {
      files: [file],
      types: ['Files'],
      items: [
        {
          kind: 'file',
          type: file.type,
          getAsFile: () => file,
        },
      ],
    },
  })
}

export const dropFilesInChat = (chatElement, files) => {
  const droppedFiles = Array.isArray(files) ? files : [files]

  fireEvent.drop(chatElement, {
    dataTransfer: {
      files: [...droppedFiles],
      types: ['Files'],
    },
  })
}

export const toggleHelpDeskChatSoundEffects = () => {
  const helpDeskChat = screen.getByLabelText('Customer service')
  const contextualMenu = within(helpDeskChat).getByRole('menu')
  const toggleSoundOption = within(contextualMenu).getByRole('menuitem', {
    name: /Mute sound|Unmute sound/,
  })

  userEvent.click(toggleSoundOption)
}
