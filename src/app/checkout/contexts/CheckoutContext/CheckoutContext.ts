import { createContext } from 'react'

import { Checkout } from 'app/checkout/interfaces'

export interface CheckoutContextState {
  checkout?: Checkout
  checkoutId?: Checkout['id']
  isLoading: boolean
  refetchCheckout: () => Promise<Checkout | undefined>
}

export const fallbackCheckoutContextState: CheckoutContextState = {
  checkout: undefined,
  checkoutId: undefined,
  isLoading: false,
  refetchCheckout: async () => undefined,
}

export const CheckoutContext = createContext<CheckoutContextState | null>(null)
