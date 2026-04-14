import { createContext } from 'react'

interface CheckoutSlotResetContextValue {
  slotResetRequested: boolean
  requestSlotReset: () => void
  clearSlotReset: () => void
}

export const CheckoutSlotResetContext =
  createContext<CheckoutSlotResetContextValue | null>(null)
