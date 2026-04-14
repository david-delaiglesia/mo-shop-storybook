import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

export const confirmCheckout = async () => {
  userEvent.click(await screen.findByRole('button', { name: 'Confirm order' }))
}

export const continueCheckoutWithTokenAuth = async () => {
  userEvent.click(await screen.findByRole('button', { name: 'Continue' }))
}

export const clickToModifyDelivery = async () => {
  const deliverySection = await screen.findByRole('region', {
    name: 'Delivery',
  })

  const editButton = within(deliverySection).getByRole('button', {
    name: 'Modify',
  })

  userEvent.click(editButton)
}

export const clickToModifyPhone = async () => {
  const phoneSection = await screen.findByRole('region', {
    name: 'Phone',
  })

  const editButton = within(phoneSection).getByRole('button', {
    name: 'Modify',
  })

  userEvent.click(editButton)
}

export const confirmAddressNotInWarehouseModal = async () => {
  const dialog = await screen.findByRole('dialog', {
    name: 'Change of address',
  })
  const button = within(dialog).getByRole('button', {
    name: 'Return to shopping trolley',
  })
  userEvent.click(button)
}

export const closeCheckoutSlotNotAvailableModal = async () => {
  const dialog = await screen.findByRole('dialog', {
    name: 'The selected delivery slot is no longer available',
  })
  const dialogButton = within(dialog).getByRole('button', {
    name: 'Choose a new slot',
  })

  userEvent.click(dialogButton)
}

export const closeOrderSlotNotAvailableModal = async () => {
  const dialog = await screen.findByRole('dialog', {
    name: "It's not possible to switch to the selected slot",
  })
  const dialogButton = within(dialog).getByRole('button', { name: 'OK' })

  userEvent.click(dialogButton)
}
