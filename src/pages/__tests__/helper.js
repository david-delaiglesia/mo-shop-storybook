import { fireEvent, screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

export const selectAddressSuggestionManually = () => {
  userEvent.click(screen.getByText('Add'))
}

export const fillManualAddressForm = async ({
  address,
  address_detail,
  postal_code,
  town,
}) => {
  const addressWithoutNumber = address.split(',')[0]
  const number = Number(address.split(',')[1]) || undefined

  const ctaContent = screen.queryByLabelText('There is no address')
  if (ctaContent) openNewAddressForm()

  const geoSuggestionField = await screen.findByLabelText('Street and number')
  await fireEvent.change(geoSuggestionField, {
    target: { name: 'suggestion_name', value: addressWithoutNumber },
  })

  await selectAddressSuggestionManually()

  const addressNameField = await screen.findByLabelText('Street name')
  await fireEvent.change(addressNameField, {
    target: { name: 'address_name', value: addressWithoutNumber },
  })

  const addressDetailField = await screen.findByLabelText('Floor, door...')
  await fireEvent.change(addressDetailField, {
    target: { name: 'address_detail', value: address_detail },
  })

  const postalCodeField = screen.getByLabelText('Postal code')
  await fireEvent.change(postalCodeField, {
    target: { name: 'postal_code', value: postal_code },
  })

  const numberField = screen.getByLabelText('Number')
  await fireEvent.change(numberField, {
    target: { name: 'address_number', value: number },
  })

  const townField = screen.getByLabelText('Town/City')
  await fireEvent.change(townField, { target: { name: 'town', value: town } })
}

export const typeManualAddressForm = async ({
  address,
  address_detail,
  postal_code,
  town,
  comments,
}) => {
  const addressWithoutNumber = address.split(',')[0]
  const number = Number(address.split(',')[1]) || undefined

  const ctaContent = screen.queryByLabelText('There is no address')
  if (ctaContent) openNewAddressForm()

  const geoSuggestionField = await screen.findByLabelText('Street and number')
  userEvent.type(geoSuggestionField, addressWithoutNumber)

  selectAddressSuggestionManually()

  const streetField = await screen.findByLabelText('Street name')
  userEvent.type(streetField, addressWithoutNumber)

  if (address_detail) {
    const addressDetailField = await screen.findByLabelText('Floor, door...')
    userEvent.type(addressDetailField, address_detail)
  }

  if (postal_code) {
    const postalCodeField = screen.getByLabelText('Postal code')
    userEvent.type(postalCodeField, postal_code)
  }

  if (number) {
    const numberField = screen.getByLabelText('Number')
    userEvent.type(numberField, number)
  }

  if (town) {
    const townField = screen.getByLabelText('Town/City')
    userEvent.type(townField, town)
  }

  if (comments) {
    const commentsField = screen.getByLabelText(
      'Additional information (E.g. There is no lift)',
    )
    userEvent.type(commentsField, comments)
  }
}

export const fillSuggestedAddressForm = async (
  { address, detail },
  suggestion,
) => {
  const ctaContent = screen.queryByLabelText('There is no address')
  if (ctaContent) openNewAddressForm()

  const geoSuggestionField = await screen.findByLabelText('Street and number')
  userEvent.type(geoSuggestionField, address)

  userEvent.click(await screen.findByLabelText(suggestion))

  if (detail) {
    const addressDetailField = await screen.findByLabelText('Floor, door...')
    userEvent.type(addressDetailField, detail)
  }
}

export const openNewAddressForm = () => {
  const ctaContent = screen.getByLabelText('There is no address')

  userEvent.click(
    within(ctaContent).getByRole('button', { name: 'Add address' }),
  )
}

export const clickToModifyPaymentMethod = async () => {
  const paymentSection = await screen.findByRole('region', {
    name: 'Payment method',
  })
  const button = await within(paymentSection).findByRole('button', {
    name: 'Modify',
  })
  userEvent.click(button)
}

export const clickToAddNewPaymentMethod = async () => {
  const addPaymentMethodButton = await screen.findByRole('button', {
    name: 'Add payment method',
  })
  userEvent.click(addPaymentMethodButton)
}

export const clickToSavePaymentMethod = async () => {
  const paymentMethodButtonSubmit = await screen.findByRole('button', {
    name: 'Save',
  })
  userEvent.click(paymentMethodButtonSubmit)
}

export const closeNewPaymentMethodModal = async () => {
  const dialogAddPaymentMethod = await screen.findByRole('dialog', {
    name: 'Add payment method',
  })
  const [closeButton] = await within(dialogAddPaymentMethod).findAllByRole(
    'button',
  )
  userEvent.click(closeButton)
}

export const selectNewPaymentMethodBizum = async () => {
  const dialogAddPaymentMethod = await screen.findByRole('dialog', {
    name: 'Add payment method',
  })
  const button = await within(dialogAddPaymentMethod).findByRole('button', {
    name: 'Bizum',
  })
  userEvent.click(button)
}

export const fillBizumForm = async (
  phoneNumber = '600123456',
  submit = true,
) => {
  const dialogAddPaymentMethod = await screen.findByRole('dialog', {
    name: 'Add payment method',
  })

  const bizumPhoneNumber = await within(dialogAddPaymentMethod).findByRole(
    'textbox',
    {
      name: 'Number',
    },
  )
  const submitButton = within(dialogAddPaymentMethod).getByRole('button', {
    name: 'Continue',
  })

  userEvent.type(bizumPhoneNumber, phoneNumber)

  if (submit) {
    userEvent.click(submitButton)
  }
}

export const selectNewPaymentMethodCard = async () => {
  const dialogAddPaymentMethod = await screen.findByRole('dialog', {
    name: 'Add payment method',
  })
  const button = await within(dialogAddPaymentMethod).findByRole('button', {
    name: 'Card',
  })
  userEvent.click(button)
}
