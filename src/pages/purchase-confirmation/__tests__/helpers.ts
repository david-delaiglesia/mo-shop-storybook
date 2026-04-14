import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

import { Order } from 'app/order'

export const finishCheckout = (orderId: Order['id']) => {
  const confirmationSection = screen.getByRole('region', {
    name: `Order ${orderId} confirmed`,
  })
  const button = within(confirmationSection).getByRole('button', {
    name: 'OK',
  })
  userEvent.click(button)
}

export const acceptDialogMessage = () => {
  const confirmationSection = screen.getByRole('dialog')
  userEvent.click(
    within(confirmationSection).getByRole('button', { name: 'OK' }),
  )
}
