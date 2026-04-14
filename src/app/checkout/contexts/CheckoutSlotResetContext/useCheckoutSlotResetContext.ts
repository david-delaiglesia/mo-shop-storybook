import { useContext } from 'react'

import { CheckoutSlotResetContext } from './CheckoutSlotResetContext'
import { monitoring } from 'monitoring'

export const useCheckoutSlotResetContext = () => {
  const ctx = useContext(CheckoutSlotResetContext)

  if (!ctx) {
    const error = new Error(
      'useCheckoutSlotResetContext must be used within a CheckoutSlotResetProvider',
    )

    monitoring.captureError(error)
    throw error
  }

  return ctx
}
