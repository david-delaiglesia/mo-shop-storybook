import { fireEvent, screen, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

const removeAddress = (address) => {
  const addressCard = getListItemCardByText(address)
  userEvent.click(within(addressCard).queryByText('Remove'))
}

const confirmRemoveAddressAlert = () => {
  const alert = screen.getByRole('dialog', {
    name: 'Remove the delivery address. Are you sure you want to remove the delivery address?',
  })
  userEvent.click(within(alert).getByText('Remove'))
}

const cancelRemoveAddressAlert = () => {
  const alert = screen.getByRole('dialog', {
    name: 'Remove the delivery address. Are you sure you want to remove the delivery address?',
  })
  userEvent.click(within(alert).getByText('Cancel'))
}

const removeAddressWhileIsBeingRemoved = () => {
  userEvent.click(screen.getByLabelText('Loading'))
}

const getListItemCardByText = (text) => {
  const card = screen
    .getAllByRole('listitem')
    .find((card) => card.textContent.includes(text))

  return card
}

const openAddressForm = () => {
  userEvent.click(screen.getByText('New delivery address'))
}

const fillAddressForm = async (addressInfo) => {
  const { address, address_detail, postal_code, town } = addressInfo
  const addressWithoutNumber = address.split(',')[0]
  const number = Number(address.split(',')[1]) || undefined

  const geoSuggestionField = screen.getByLabelText('Street name')
  fireEvent.change(geoSuggestionField, {
    target: { name: 'address_name', value: addressWithoutNumber },
  })

  const addressDetailField = screen.getByLabelText('Floor, door...')
  fireEvent.change(addressDetailField, {
    target: { name: 'address_detail', value: address_detail },
  })

  const postalCodeField = screen.getByLabelText('Postal code')
  fireEvent.change(postalCodeField, {
    target: { name: 'postal_code', value: postal_code },
  })

  const numberField = screen.getByLabelText('Number')
  fireEvent.change(numberField, {
    target: { name: 'address_number', value: number },
  })

  const townField = screen.getByLabelText('Town/City')
  fireEvent.change(townField, { target: { name: 'town', value: town } })
}

const saveAddress = () => {
  const saveAddressButton = screen.getByRole('button', { name: 'Save' })
  fireEvent.click(saveAddressButton)
}

const saveAddressWithEnter = () => {
  userEvent.type(screen.getByLabelText('Number'), '{enter}')
}

const confirmNotAvailablePostalCodeAlert = () => {
  const alert = screen.getByRole('dialog')
  userEvent.click(within(alert).getByRole('button', { name: 'OK' }))
}

const confirmErrorAlert = () => {
  fireEvent.click(screen.getByRole('button', { name: 'OK' }))
}

export const confirmIncompleteErrorAlert = () => {
  userEvent.click(
    within(screen.getByRole('dialog')).getByRole('button', { name: 'Save' }),
  )
}

const closeNotAvailablePostalCodeAlert = () => {
  const alert = screen.getByRole('dialog')
  userEvent.click(within(alert).getByLabelText('Close'))
}

const fillPostalCodeField = (postal_code) => {
  const postalCodeField = screen.getByLabelText('Postal code')
  userEvent.type(postalCodeField, postal_code)
}

export const fillAddressNumberField = (number, options = { blur: false }) => {
  const numberField = screen.getByLabelText('Number')
  userEvent.type(numberField, number)

  if (options.blur) {
    userEvent.tab()
  }
}

const removeLastCharacterFromValidPostalCodeField = (
  options = { blur: false },
) => {
  const postalCodeField = screen.getByLabelText('Postal code')
  userEvent.type(postalCodeField, `{backspace}`)

  if (options.blur) {
    userEvent.tab()
  }
}

const removeLastCharacterFromTownField = (options = { blur: false }) => {
  const townField = screen.getByLabelText('Town/City')
  userEvent.type(townField, `{backspace}`)

  if (options.blur) {
    userEvent.tab()
  }
}

export const goBack = () => {
  userEvent.click(screen.getByRole('button', { name: 'Go back' }))
}

export const confirmAddressConfirmationModal = () => {
  const alert = screen.getByRole('dialog', {
    name: 'Indicate address',
  })

  const confirmButton = within(alert).getByRole('button', { name: 'Confirm' })
  userEvent.click(confirmButton)
}

export {
  cancelRemoveAddressAlert,
  closeNotAvailablePostalCodeAlert,
  confirmErrorAlert,
  confirmNotAvailablePostalCodeAlert,
  confirmRemoveAddressAlert,
  fillAddressForm,
  openAddressForm,
  removeAddress,
  removeAddressWhileIsBeingRemoved,
  saveAddress,
  saveAddressWithEnter,
  fillPostalCodeField,
  removeLastCharacterFromValidPostalCodeField,
  removeLastCharacterFromTownField,
}
