import { fireEvent, screen, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

const confirmRemoveElementAlert = () => {
  const alert = screen.getByRole('dialog')
  userEvent.click(within(alert).getByText('Remove'))
}

const getListItemCardByText = (text) => {
  const card = screen
    .getAllByRole('listitem')
    .find((card) => card.textContent.includes(text))

  return card
}

const clickElementDeleteButton = (elementText) => {
  const container = getListItemCardByText(elementText)
  const optionsButton = within(container).getByRole('button', {
    name: 'Options',
  })
  userEvent.click(optionsButton)

  const optionsMenu = within(container).getByRole('menu')
  userEvent.click(within(optionsMenu).getByRole('menuitem', { name: 'Remove' }))
}

const clickElementDefaultButton = (elementText) => {
  const container = getListItemCardByText(elementText)
  const optionsButton = within(container).getByRole('button', {
    name: 'Options',
  })
  userEvent.click(optionsButton)

  const optionsMenu = within(container).getByRole('menu')
  userEvent.click(
    within(optionsMenu).getByRole('menuitem', { name: 'Set as default' }),
  )
}

const goToCategories = () => {
  userEvent.click(screen.getByText('Start your order'))
}

const goToEditOrder = () => {
  userEvent.click(screen.getByText('Modify order'))
}

const editOrderFromProductSection = () => {
  const { getByLabelText } = within(screen.getByTestId('order-products'))

  userEvent.click(getByLabelText('Modify'))
}

const openOrderLines = () => {
  userEvent.click(screen.getByTestId('open-order-lines'))
}

const downloadTicket = () => {
  userEvent.click(screen.getByText('Download ticket'))
}

const downloadTicketFromLink = () => {
  userEvent.click(screen.getByText('download.'))
}

const fillPhone = (phone) => {
  const event = { target: { name: 'phone', value: phone } }
  fireEvent.change(screen.getByLabelText('Phone number'), event)
}

const saveContactInfo = () => {
  userEvent.click(screen.getByLabelText('Save'))
}

const repeatOrder = () => {
  userEvent.click(screen.getByText('Repeat order'))
}

const repeatOrderFromProductList = () => {
  openOrderLines()
  const [, repeatOrderButtonFromOrderLines] = screen.getAllByRole('button', {
    name: 'Repeat order',
  })
  userEvent.click(repeatOrderButtonFromOrderLines)
}

const confirmRepeatOrder = () => {
  userEvent.click(screen.getByText('Continue'))
}

const cancelRepeatOrder = () => {
  userEvent.click(screen.getByText('Cancel'))
}

const selectDeliveryDate = (day) => {
  const daysGroup = screen.getByRole('group', {
    name: 'Choose a day to display the available delivery times',
  })
  userEvent.click(within(daysGroup).getByRole('button', { name: day }))
}

const selectAnotherDayBlinkingProduct = () => {
  const modal = screen.getByRole('dialog')
  const button = within(modal).getByRole('button', {
    name: 'Choose another day',
  })

  userEvent.click(button)
}

const selectDifferentDayBlinkingProduct = () => {
  const modal = screen.getByRole('dialog')
  const button = within(modal).getByRole('button', {
    name: 'Select a different day',
  })

  userEvent.click(button)
}

const confirmRemoveBlinkingProduct = () => {
  const modal = screen.getByRole('dialog')
  const button = within(modal).getByRole('button', { name: 'Continue' })

  fireEvent.click(button)
}

const selectSlot = (selector) => {
  userEvent.click(screen.getByRole('button', { name: selector }))
}

const confirmSlot = () => {
  userEvent.click(screen.getByRole('button', { name: 'Save' }))
}

const selectLastEditMessage = (text) => {
  userEvent.click(screen.getByText(text))
}

const doLogout = () => {
  userEvent.click(screen.getByText('Logout'))
}

const cancelLogout = () => {
  const modal = screen.getByRole('dialog')
  userEvent.click(within(modal).getByRole('button', { name: 'Cancel' }))
}

const confirmLogout = () => {
  const modal = screen.getByRole('dialog')
  userEvent.click(within(modal).getByRole('button', { name: 'Logout' }))
}

const goToFAQs = () => userEvent.click(screen.getByText('FAQ'))

const authorizeMIT = () => {
  userEvent.click(screen.getByText('Authorise'))
}

const showPriceDetail = () => {
  userEvent.hover(screen.getByTestId('estimated-cost-tooltip'))
}

const hoverText = (text) => {
  userEvent.hover(text)
}

const openChangeAddressSelector = () => {
  userEvent.click(screen.getByText('Change address'))
}

const confirmAddressChange = () => {
  userEvent.click(screen.getByTestId('address-save-button'))
}

const selectAddress = (address) => {
  userEvent.click(screen.getByText(address))
}

const cancelOrder = () => {
  userEvent.click(screen.getByText('Cancel order'))
}

const closeCancelOrderAlert = () => {
  const alert = screen.getByRole('dialog', {
    name: 'Cancel order?. If you continue, you will lose the reserved date and delivery time slot.',
  })
  userEvent.click(within(alert).getByRole('button', { name: 'Cancel' }))
}

const confirmCancelOrderAlert = () => {
  const alert = screen.getByRole('dialog', {
    name: 'Cancel order?. If you continue, you will lose the reserved date and delivery time slot.',
  })
  userEvent.click(
    within(alert).getByRole('button', { name: 'Yes, cancel order' }),
  )
}

const editEmail = () => {
  const card = screen.getByText('Email').closest('li')
  fireEvent.click(within(card).getByText('Modify'))
}

const addAddress = () => {
  fireEvent.click(screen.getByText('New delivery address'))
}

const editOrderPayment = () => {
  const paymentSection = screen.getByRole('region', {
    name: 'Payment',
  })

  const editButton = within(paymentSection).getByRole('button', {
    name: 'Modify',
  })

  userEvent.click(editButton)
}

const saveEditOrderPayment = () => {
  const paymentSection = screen.getByRole('region', {
    name: 'Payment',
  })

  const saveButton = within(paymentSection).getByRole('button', {
    name: 'Save',
  })
  userEvent.click(saveButton)
}

const addNewPaymentMethod = () => {
  const paymentSection = screen.getByRole('region', {
    name: 'Payment method',
  })

  const addButton = within(paymentSection).getByRole('button', {
    name: 'Add card',
  })

  userEvent.click(addButton)
}

const continueWithoutBlinkingProduct = () => {
  const modal = screen.getByRole('dialog')
  const button = within(modal).getByRole('button', {
    name: 'Continue without the products',
  })

  userEvent.click(button)
}

const closeOrderUpdatedDialog = () => {
  const button = within(screen.getByRole('dialog')).getByRole('button', {
    name: 'Understood',
  })
  userEvent.click(button)
}

const invoiceRequest = () => {
  userEvent.click(screen.getByText('Request invoice'))
}

const invoiceRequested = () => {
  userEvent.click(screen.getByText('Invoice requested'))
}

const clickOnEditDocumentId = () => {
  const modal = screen.getByRole('dialog', { name: 'Invoice requested' })
  userEvent.click(within(modal).getByRole('textbox'))
}

const editDocumentId = (personalId) => {
  const personalIdInput = screen.getByLabelText(
    'ID, resident ID or Corporate Tax ID number',
  )
  userEvent.type(personalIdInput, personalId)
}

const invoiceRequestModalConfirm = async () => {
  const modal = screen.getByRole('dialog', { name: 'Request invoice' })
  await userEvent.click(within(modal).getByRole('button', { name: 'Confirm' }))
}

const onCancelInvoiceRequestModal = () => {
  const modal = screen.getByRole('dialog', { name: 'Request invoice' })
  userEvent.click(within(modal).getByRole('button', { name: 'Cancel' }))
}

const modifyDocumentIdConfirm = () => {
  const modal = screen.getByRole('dialog', { name: 'Modify invoice' })
  userEvent.click(within(modal).getByRole('button', { name: 'Confirm' }))
}

const onCloseModifyModal = () => {
  const modal = screen.getByRole('dialog', { name: 'Modify invoice' })
  userEvent.click(within(modal).getByRole('button', { name: 'Cancel' }))
}

const fillPersonalDocument = (personalId) => {
  const personalIdInput = screen.getByLabelText(
    'ID, resident ID or Corporate Tax ID number',
  )
  userEvent.type(personalIdInput, personalId)
}

const goToPortalFacturas = () => {
  userEvent.click(
    screen.getByRole('link', { name: 'Go to the Invoices portal' }),
  )
}

const closePersonalIdNotRegisteredModal = () => {
  userEvent.click(screen.getByRole('button', { name: 'Cancel' }))
}

const closeDocumentStillNotRegisteredModal = async () => {
  const documentStillNotRegisteredModal = await screen.findByRole('dialog', {
    name: 'It appears that the document is still not registered',
  })
  userEvent.click(
    within(documentStillNotRegisteredModal).getByRole('button', {
      name: 'Exit without saving',
    }),
  )
}

const tryAgainDocumentRegistration = async () => {
  const documentStillNotRegisteredModal = await screen.findByRole('dialog', {
    name: 'It appears that the document is still not registered',
  })
  userEvent.click(
    within(documentStillNotRegisteredModal).getByRole('button', {
      name: 'Try again',
    }),
  )
}

export const selectBizumPaymentMethod = async () => {
  const paymentSection = screen.getByRole('region', {
    name: 'Payment method',
  })

  const bizumPaymentMethod = within(paymentSection).getByRole('button', {
    name: 'Pay using Bizum',
  })

  userEvent.click(bizumPaymentMethod)
}

export const fillBizumForm = async (
  phoneNumber = '600123456',
  submit = true,
) => {
  const paymentSection = screen.getByRole('region', {
    name: 'Payment method',
  })

  const bizumPhoneNumber = await within(paymentSection).findByRole('textbox', {
    name: 'Number',
  })
  const submitButton = within(paymentSection).getByRole('button', {
    name: 'Continue',
  })

  userEvent.type(bizumPhoneNumber, phoneNumber)

  if (submit) {
    userEvent.click(submitButton)
  }
}

export {
  addAddress,
  authorizeMIT,
  cancelLogout,
  cancelOrder,
  cancelRepeatOrder,
  clickElementDefaultButton,
  clickElementDeleteButton,
  closeCancelOrderAlert,
  confirmAddressChange,
  confirmCancelOrderAlert,
  confirmLogout,
  confirmRemoveElementAlert,
  confirmRepeatOrder,
  confirmSlot,
  doLogout,
  downloadTicket,
  downloadTicketFromLink,
  editEmail,
  editOrderFromProductSection,
  editOrderPayment,
  fillPhone,
  getListItemCardByText,
  goToCategories,
  goToEditOrder,
  goToFAQs,
  openChangeAddressSelector,
  openOrderLines,
  repeatOrder,
  repeatOrderFromProductList,
  saveContactInfo,
  saveEditOrderPayment,
  addNewPaymentMethod,
  selectAddress,
  selectLastEditMessage,
  selectSlot,
  selectDeliveryDate,
  selectAnotherDayBlinkingProduct,
  confirmRemoveBlinkingProduct,
  showPriceDetail,
  selectDifferentDayBlinkingProduct,
  continueWithoutBlinkingProduct,
  closeOrderUpdatedDialog,
  hoverText,
  invoiceRequest,
  invoiceRequestModalConfirm,
  fillPersonalDocument,
  goToPortalFacturas,
  closePersonalIdNotRegisteredModal,
  closeDocumentStillNotRegisteredModal,
  tryAgainDocumentRegistration,
  invoiceRequested,
  clickOnEditDocumentId,
  editDocumentId,
  modifyDocumentIdConfirm,
  onCloseModifyModal,
  onCancelInvoiceRequestModal,
}
