import { fireEvent, screen } from '@testing-library/react'

export const addNewPaymentMethod = () => {
  fireEvent.click(screen.getByLabelText('Add new card for this order'))
}

export const selectPaymentMethod = (paymentMethod) => {
  fireEvent.click(screen.getByText(paymentMethod).closest('label'))
}

export const confirm = () => {
  fireEvent.click(screen.getByText('Continue'))
}

export const cancel = () => {
  fireEvent.click(screen.getByText('Cancel'))
}
