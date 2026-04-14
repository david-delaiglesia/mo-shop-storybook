import { act, fireEvent, screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

export const openAddressSelector = () => {
  fireEvent.click(screen.getByText('Change address'))
}

export const openChangeAddressSelector = () => {
  fireEvent.click(screen.getByText('Change address'))
}

export const editAddress = async (address) => {
  const addressCellButton = await screen.findByText(`${address}`)
  fireEvent.click(addressCellButton)

  const confirmAddressButton = await screen.findByText('Accept')
  fireEvent.click(confirmAddressButton)
}

export const confirmAddressList = () => {
  fireEvent.click(screen.getByText('Accept'))
}

export const selectSlot = (slot) => {
  const slotsGroup = screen.getByRole('group', {
    name: 'Choose a slot and confirm to proceed with the purchase',
  })
  userEvent.click(within(slotsGroup).getByRole('button', { name: slot }))
}

export const selectFirstSlot = () => {
  const slotsGroup = screen.getByRole('group', {
    name: 'Choose a slot and confirm to proceed with the purchase',
  })

  const [firstSlot] = within(slotsGroup).getAllByRole('button')

  userEvent.click(firstSlot)
}

export const cancelSlotsEdition = () => {
  fireEvent.click(screen.getByText('Cancel'))
}

export const confirmSlot = () => {
  fireEvent.click(screen.getByRole('button', { name: 'Save' }))
}

export const selectAndConfirmFirstSlot = () => {
  const slotsGroup = screen.getByRole('group', {
    name: 'Choose a slot and confirm to proceed with the purchase',
  })

  const [firstSlot] = within(slotsGroup).getAllByRole('button')
  userEvent.click(firstSlot)

  const confirmSlot = screen.getByText('Save')
  userEvent.click(confirmSlot)
}

export const selectDeliveryDate = (day) => {
  const button = screen.getByText(day.toString())

  fireEvent.click(button)
}

export const selectSaturdayDeliveryDate = () => {
  const button = screen.getAllByText('SAT')[1]
  fireEvent.click(button)
}

export const confirmCheckout = () => {
  userEvent.click(screen.getByRole('button', { name: 'Confirm order' }))
}

export const selectPaymentMethod = (card) => {
  fireEvent.click(screen.getByText(card))
}

export const editContactInfo = () => {
  const contactCard = screen.getByRole('region', { name: 'Phone' })
  const editContactButton = within(contactCard).getByRole('button', {
    name: 'Modify',
  })

  userEvent.click(editContactButton)
}

export const saveContactInfo = () => {
  const contactCard = screen.getByRole('region', { name: 'Phone' })
  const button = within(contactCard).getByRole('button', {
    name: 'Save',
  })
  userEvent.click(button)
}

export const fillPhone = (phone) => {
  const event = { target: { name: 'phone', value: phone } }
  fireEvent.change(screen.getByLabelText('Phone number'), event)
}

export const saveChanges = () => {
  fireEvent.click(screen.getByText('Save'))
}

export const addPaymentMethod = () => {
  fireEvent.click(screen.getByText('Add card'))
}

export const confirmAddPaymentMethod = () => {
  window.cbOk()
}

export const selectChangeAddressOption = (container) => {
  const { getByText } = within(container)
  fireEvent.click(getByText('change_address'))
}

export const confirmAddressForm = () => {
  fireEvent.click(screen.getByLabelText('Save'))
}

export const confirmInaccurateAddressModal = () => {
  userEvent.click(screen.getByRole('button', { name: 'Indicate on the map' }))
}

export const confirmAddressSaveAlert = () => {
  fireEvent.click(screen.getByText('It is correct'))
}

export const selectAddress = (address) => {
  userEvent.click(screen.getByText(address))
}

export const confirmErrorAlert = () => {
  fireEvent.click(screen.getByText('OK'))
}

export const closeTab = () => {
  window.dispatchEvent(new Event('beforeunload'))
  window.dispatchEvent(new Event('unload'))
}

export const goBackWithTheBrowser = (history) => {
  history.goBack()
}

export const openCountryCodeSelector = (selectedCountryCode) => {
  fireEvent.click(screen.getByText(`+${selectedCountryCode}`))
}

export const selectCountryCode = (newCountryCode) => {
  fireEvent.click(screen.getByText(new RegExp(newCountryCode)))
}

export const closeSCAWithoutSaving = () => {
  fireEvent.click(screen.getByText('Close'))
}

export const closeCheckoutAuthModal = () => {
  const backButton = within(screen.getByRole('dialog')).getByRole('button', {
    name: 'Back',
  })
  userEvent.click(backButton)
}

export const authorizeMIT = () => {
  fireEvent.click(screen.getByText('Authorise'))
}

export const addNewAddress = () => {
  fireEvent.click(screen.getByText('Add address'))
}

export const selectFirstAvailableDay = () => {
  const daysGroup = screen.getByRole('group', {
    name: 'Choose a day to display the available delivery times',
  })

  const calendarDays = within(daysGroup).getAllByRole('button')

  const firstAvailableDay = calendarDays.find((day) => {
    return !day.disabled
  })

  userEvent.click(firstAvailableDay)
}

export const selectNthAvailableDay = (n) => {
  const daysGroup = screen.getByRole('group', {
    name: 'Choose a day to display the available delivery times',
  })

  const calendarDays = within(daysGroup)
    .getAllByRole('button')
    .filter((day) => !day.disabled)

  userEvent.click(calendarDays[n])
}

export const pageLoadedFromCache = () => {
  const newPageShow = new Event('pageshow')
  newPageShow.persisted = true
  window.dispatchEvent(newPageShow)
}

export const confirmDuplicateOrdersAlert = () => {
  const modal = screen.getByRole('dialog')
  const confirmButton = within(modal).getByRole('button', {
    name: 'Confirm order',
  })
  fireEvent.click(confirmButton)
}

export const cancelDuplicateOrdersAlert = () => {
  const modal = screen.getByRole('dialog')
  const cancelButton = within(modal).getByRole('button', {
    name: 'Cancel',
  })
  fireEvent.click(cancelButton)
}

export const closeFailedAuthenticationAlert = () => {
  const button = within(screen.getByRole('dialog')).getByRole('button', {
    name: 'Understood',
  })
  fireEvent.click(button)
}

export const continueTokenAuthnFlow = () => {
  const button = screen.getByRole('button', {
    name: 'Continue',
  })
  userEvent.click(button)
}

export const cancelMitModal = () => {
  const button = screen.getByRole('button', {
    name: 'Back unconfirmed',
  })
  userEvent.click(button)
}

export const closeTokenAuthnPaymentModal = () => {
  const addPaymentModal = screen.getByRole('dialog', {
    name: 'Confirm order',
  })

  const closeButton = within(addPaymentModal).getByRole('button', {
    name: 'Close',
  })

  userEvent.click(closeButton)
}

export const authoriseMitTermsModal = () => {
  const mitTermsModal = screen.getByRole('dialog', {
    name: 'Authorisation required',
  })
  const authoriseButton = within(mitTermsModal).getByRole('button', {
    name: 'Authorise',
  })
  userEvent.click(authoriseButton)
}

export const confirmTokenAuthnScaChallenge = () => {
  window.cbOk()
}

export const failTokenAuthnScaChallenge = () => {
  window.cbKo()
}

export const closeModal = () => {
  const errorModal = screen.getByRole('dialog')
  const okButton = within(errorModal).getByRole('button', { name: 'OK' })
  userEvent.click(okButton)
}

export const closeNotConfirmedModal = () => {
  const errorModal = screen.getByRole('dialog', {
    name: 'Order not confirmed. We need you to authorise the card payment to be able to confirm your order.',
  })

  const closeErrorModalButton = within(errorModal).getByRole('button', {
    name: 'Understood',
  })

  userEvent.click(closeErrorModalButton)
}

export const tryAgainAfterPaymentError = () => {
  const errorModal = screen.getByRole('dialog', {
    name: 'We’re sorry, we couldn’t complete the order. It looks like there was a problem with the bank authorisation. You can try with another card or find more information in the Help section.',
  })

  const tryAgainButton = within(errorModal).getByRole('button', {
    name: 'Try again',
  })

  userEvent.click(tryAgainButton)
}

export const tryAgainAfterGenericPaymentError = () => {
  const errorModal = screen.getByRole('dialog', {
    name: 'The transaction could not be carried out',
  })

  const tryAgainButton = within(errorModal).getByRole('button', {
    name: 'Retry',
  })

  userEvent.click(tryAgainButton)
}

export const cancelPhoneNumberEdition = () => {
  userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
}

export const closeAddCardIframe = () => {
  const closeButton = screen.getByRole('button', {
    name: 'Close',
  })
  userEvent.click(closeButton)
}

export const selectAnotherDayBlinkingProduct = () => {
  const modal = screen.getByRole('dialog')
  const button = within(modal).getByRole('button', {
    name: 'Choose another day',
  })

  fireEvent.click(button)
}

export const selectDifferentDayBlinkingProduct = () => {
  const modal = screen.getByRole('dialog')
  const button = within(modal).getByRole('button', {
    name: 'Select a different day',
  })

  fireEvent.click(button)
}

export const confirmRemoveBlinkingProduct = () => {
  const modal = screen.getByRole('dialog')
  const button = within(modal).getByRole('button', { name: 'Continue' })

  fireEvent.click(button)
}
export const continueWithoutBlinkingProduct = () => {
  const modal = screen.getByRole('dialog')
  const button = within(modal).getByRole('button', {
    name: 'Continue without the products',
  })

  fireEvent.click(button)
}

export const keepShopping = () => {
  const modal = screen.getByRole('dialog')
  const button = within(modal).getByRole('button', {
    name: 'Continue shopping',
  })

  fireEvent.click(button)
}

export const closeAdressConfirmationModal = () => {
  const alert = screen.getByRole('dialog', {
    name: 'Indicate address',
  })
  const cancelButton = within(alert).getByRole('button', { name: 'Cancel' })

  fireEvent.click(cancelButton)
}

export const confirmAdressConfirmationModal = () => {
  const alert = screen.getByRole('dialog', {
    name: 'Indicate address',
  })
  const confirmButton = within(alert).getByRole('button', { name: 'Confirm' })

  fireEvent.click(confirmButton)
}

export const idlePositionEvent = async (map) =>
  await act(async () => {
    map.dispatchEvent('idle')
    map.dispatchEvent('idle')
  })

export const centeredChangedEvent = async (map) =>
  await act(async () => {
    map.dispatchEvent('idle')
    map.dispatchEvent('center_changed')
  })

export const maptypeidChangedEvent = async (map) =>
  await act(async () => {
    map.dispatchEvent('maptypeid_changed')
  })

export const zoomChangedEvent = async (map) =>
  await act(async () => {
    map.dispatchEvent('zoom_changed')
  })

export const locateMe = () => {
  const alert = screen.getByRole('dialog', {
    name: 'Indicate address',
  })
  const locateMeButton = within(alert).getByRole('button', {
    name: 'Use current location',
  })
  userEvent.click(locateMeButton)
}

export const closeLocateMeWarningModal = () => {
  const warningModal = screen.getByRole('dialog', {
    name: "The browser has blocked access to your location. Change your browser's privacy settings to use your location.",
  })
  const button = within(warningModal).getByRole('button', {
    name: 'OK',
  })

  userEvent.click(button)
}
