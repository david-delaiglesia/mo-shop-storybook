import { createContext } from 'react'

export interface CheckoutPaymentsContextState {
  isConfirming?: boolean
  confirmCheckout: () => void

  updatePaymentMethodWithBizum: (phone: {
    phoneCountryCode: string
    phoneNationalNumber: string
  }) => Promise<void>
}

export const CheckoutPaymentsContext =
  createContext<CheckoutPaymentsContextState | null>(null)
