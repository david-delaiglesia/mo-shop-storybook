import { screen, within } from '@testing-library/react'

import userEvent from '@testing-library/user-event'

export const findPaymentMethodSection = async () => {
  return screen.findByRole('region', { name: 'Payment method' })
}

export const selectExistentPaymentMethod = async (paymentMethod: string) => {
  userEvent.click(await screen.findByRole('radio', { name: paymentMethod }))
}

export const savePaymentMethod = () => {
  userEvent.click(screen.getByText('Save'))
}

export const continueWithSCA = async () => {
  const authModal = await screen.findByRole('dialog', {
    name: 'Important changes in online payment',
  })
  const continueButton = within(authModal).getByRole('button', {
    name: 'Continue',
  })
  userEvent.click(continueButton)
}

export const closeSCAWithoutSaving = () => {
  userEvent.click(screen.getByText('Close'))
}

export const tryAnotherPaymentMethod = () => {
  const errorModal = screen.getByRole('dialog')
  const tryAgainButton = within(errorModal).getByRole('button', {
    name: 'Try again',
  })
  userEvent.click(tryAgainButton)
}

export const clickToResolvePaymentIncidentWidget = (id = '44051') => {
  const widget = screen.getByRole('listitem', {
    name: `Order ${id}, Payment has failed Please resolve the issue to receive your order.`,
  })

  const actionButton = within(widget).getByRole('button', {
    name: 'Solve incident',
  })

  userEvent.click(actionButton)
}
export const clickToResolveOrderPaymentPendingIssue = () => {
  const statusAction = screen.getByRole('button', {
    name: 'Solve incident',
  })

  userEvent.click(statusAction)
}

export const clickToModifyPaymentMethodResolvePaymentIncident = async () => {
  const modal = screen.getByRole('dialog')

  const button = await within(modal).findByRole('button', {
    name: 'Modify',
  })

  userEvent.click(button)
}

export const clickToGoBack = async () => {
  const modal = screen.getByRole('dialog')

  const button = await within(modal).findByRole('button', {
    name: 'Go back',
  })

  userEvent.click(button)
}

export const clickToRetryPayment = () => {
  const modal = screen.getByRole('dialog')

  const button = within(modal).getByRole('button', {
    name: 'Retry payment',
  })

  userEvent.click(button)
}

export const clickToResolveOrderPaymentIssue = () => {
  const statusSection = screen.getByRole('status', {
    name: 'Payment has failed',
  })
  const statusAction = within(statusSection).getByRole('button', {
    name: 'Solve incident',
  })

  userEvent.click(statusAction)
}

export const clickToCancelPaymentAuthenticating = () => {
  const modal = screen.getByRole('dialog')

  const button = within(modal).getByRole('button', {
    name: 'Close',
  })

  userEvent.click(button)
}

export const cancelMitTermsModal = () => {
  const mitTermsModal = screen.getByRole('dialog', {
    name: 'Authorisation required',
  })
  userEvent.click(within(mitTermsModal).getByRole('button', { name: 'Back' }))
}
